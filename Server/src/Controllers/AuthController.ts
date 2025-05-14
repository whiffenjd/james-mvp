import { Request, Response } from "express";
import { getUserProfileByRole, loginUser } from "../Services/AuthServices";
import { Role } from "../Types/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const result = await loginUser(email, password, role);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role as Role;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const profile = await getUserProfileByRole(userId, role);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
