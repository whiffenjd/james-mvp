import { Request, Response } from 'express';
import { registerInvestor } from '../Services/AuthServices';
import { CustomRequest } from '../Middlewares/subdomain.middleware';

export const signupInvestor = async (req: CustomRequest, res: Response) => {
  try {
    const { name, email, password, referralId } = req.body;

    const result = await registerInvestor(req, name, email, password, referralId);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
};
