import {Router} from 'express';
import {pool} from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
    const {rows}=await pool.query('SELECT NOW() AS hora');
    res.json({estado: 'ok', baseDeDatos: 'conetdada', hora: rows[0].hora});
});

export default router;