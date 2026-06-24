import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response): any => {
  const { email, password } = req.body;

  if (email === 'admin@claritiq.com' && password === 'claritiq123') {
    return res.status(200).json({
      token: 'fake-jwt-token-for-hackathon',
      user: {
        email: 'admin@claritiq.com',
        role: 'Admin',
        name: 'Priya Sharma'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
