import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response): any => {
  const { email, password } = req.body;

  if (email === 'admin@queuecure.com' && password === 'queuecure123') {
    return res.status(200).json({
      token: 'fake-jwt-token-for-hackathon',
      user: {
        email: 'admin@queuecure.com',
        role: 'Admin',
        name: 'Priya Sharma'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
