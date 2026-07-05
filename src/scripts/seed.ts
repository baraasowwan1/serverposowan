// Run: npx ts-node src/scripts/seed.ts
// Creates the default superadmin account

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Settings } from "../models/Settings";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to MongoDB");

  // Create default settings
  const settingsExists = await Settings.findOne();
  if (!settingsExists) {
    await Settings.create({});
    console.log("✅ Default settings created");
  }

  // Create platform superadmin
  const adminExists = await User.findOne({ username: "superadmin" });
  if (!adminExists) {
    await User.create({
      name: "مالك المنصة",
      email: "superadmin@platform.io",
      username: "superadmin",
      password: "SuperAdmin@2026",
      role: "مالك المنصة",
      permissions: ["*"],
      status: "نشط",
    });
    console.log("✅ Platform owner created: superadmin / SuperAdmin@2026");
  } else {
    console.log("ℹ️  Platform owner already exists");
  }

  // Create default store admin
  const storeAdminExists = await User.findOne({ username: "admin" });
  if (!storeAdminExists) {
    await User.create({
      name: "أحمد محمد الرشيد",
      email: "admin@pos.jo",
      username: "admin",
      password: "123456",
      role: "مدير النظام",
      permissions: 8,
      storeSlug: "supermarket-al-nour",
      status: "نشط",
    });
    console.log("✅ Store admin created: admin / 123456");
  } else {
    console.log("ℹ️  Store admin already exists");
  }

  await mongoose.disconnect();
  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
