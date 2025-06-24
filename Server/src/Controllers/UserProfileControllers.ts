import { Request, Response } from 'express';
import { getAllUsers, getUserProfileByRole } from '../Services/AuthServices';

import { Role, User } from '../Types/User';
import { getCache, setCache } from '../Utils/Caching';

export const getUserProfile = async (req: Request, res: Response) => {
  const requestStart = performance.now();

  try {
    const userId = req.user?.id;
    const role = req.user?.role as Role;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User Data',
      });
    }

    const profile = await getUserProfileByRole(userId, role);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch the selected theme if it exists

    const formattedProfile = {
      ...profile,
      role: profile.role as Role,
      theme: profile.selectedTheme,
    };

    console.log('formattedProfile', formattedProfile);
    return res.status(200).json({
      success: true,
      message: 'Profile fetched from database',
      data: formattedProfile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Your Account is not authorized to perform this action',
      });
    }
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
