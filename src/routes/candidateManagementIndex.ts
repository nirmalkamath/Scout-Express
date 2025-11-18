import { Router } from 'express';
import candidateManagementRoutes from './candidateManagementRoutes';

const router = Router();

// Mount all candidate management routes
router.use('/candidates', candidateManagementRoutes);

export default router;
