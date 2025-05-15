import { Request, Response } from "express";
import { getAllUsers, getUserProfileByRole } from "../Services/AuthServices";
import { Role } from "../Types/User";
import { db } from "../db/DbConnection";
import { UsersTable } from "../db/schema";
import cache from "../Utils/Caching";
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role as Role;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Data",
      });
    }

    // Try to get from cache first
    const cacheKey = `userProfile`;
    let profile = cache.get(cacheKey);

    if (!profile) {
      profile = await getUserProfileByRole(userId, role);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      cache.set(cacheKey, profile);
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
