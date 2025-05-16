import { Request, Response } from "express";
import { getAllUsers, getUserProfileByRole } from "../Services/AuthServices";
import { getCache, setCache } from "../Utils/Caching";
import { Role, User } from "../Types/User";

export const getUserProfile = async (req: Request, res: Response) => {
  const requestStart = performance.now();

  try {
    const userId = req.user?.id;
    const role = req.user?.role as Role;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Data",
      });
    }

    // Use a single cache key strategy
    const cacheKey = `userProfile:${userId}`;

    // Important: Check cache FIRST, before any DB operation
    const cachedProfile = getCache<User>(cacheKey);

    if (cachedProfile) {
      // Return cached data immediately without any DB operation
      const requestEnd = performance.now();
      // console.log(
      //   `⚡ CACHE HIT: Total request processed in ${(requestEnd - requestStart).toFixed(2)}ms`
      // );

      return res.status(200).json({
        success: true,
        message: "Profile fetched from cache",
        data: cachedProfile,
      });
    }

    // Only hit the database if cache missed
    const profile = await getUserProfileByRole(userId, role);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format profile and cache it
    const formattedProfile = { ...profile, role: profile.role as Role };
    setCache(cacheKey, formattedProfile, 300); // Cache for 5 minutes

    // const requestEnd = performance.now();
    // console.log(
    //   `🐢 CACHE MISS: Total request processed in ${(requestEnd - requestStart).toFixed(2)}ms`
    // );

    return res.status(200).json({
      success: true,
      message: "Profile fetched from database",
      data: formattedProfile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Your Account is not authorized to perform this action",
      });
    }
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
