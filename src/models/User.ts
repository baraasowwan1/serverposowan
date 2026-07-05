import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "admin" | "manager" | "cashier" | "inventory";
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  matchPassword(entered: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ["superadmin", "admin", "manager", "cashier", "inventory"],
    default: "cashier",
  },
  permissions: { type: [String], default: [] },
  isActive:    { type: Boolean, default: true },
  lastLogin:   { type: Date },
  avatar:      { type: String },
  phone:       { type: String },
}, { timestamps: true });

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered: string): Promise<boolean> {
  return bcrypt.compare(entered, this.password);
};

// Default permissions by role
UserSchema.pre("save", function (next) {
  if (!this.isModified("role")) return next();
  const rolePerms: Record<string, string[]> = {
    superadmin: ["*"],
    admin: ["dashboard", "pos", "products", "inventory", "sales", "purchases", "customers", "suppliers", "expenses", "reports", "users", "settings"],
    manager:   ["dashboard", "pos", "products", "inventory", "sales", "purchases", "customers", "suppliers", "expenses", "reports"],
    cashier:   ["dashboard", "pos", "sales", "customers"],
    inventory: ["dashboard", "products", "inventory", "purchases", "suppliers"],
  };
  if (!this.permissions.length) this.permissions = rolePerms[this.role] ?? [];
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);
