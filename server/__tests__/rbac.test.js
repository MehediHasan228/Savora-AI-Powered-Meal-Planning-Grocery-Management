/**
 * RBAC Middleware Tests
 */
const { ROLE_PERMISSIONS, authorize } = require('../middleware/rbacMiddleware');

describe('RBAC Middleware Logic', () => {
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    const mockNext = jest.fn();

    it('should allow SUPER_ADMIN to bypass all checks', () => {
        const req = { user: { role: 'SUPER_ADMIN' } };
        const middleware = authorize('AI', 'TUNING');
        middleware(req, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should allow ADMIN to access permitted modules', () => {
        const req = { user: { role: 'ADMIN' } };
        const middleware = authorize('AI', 'TUNING');
        middleware(req, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if role does not have permission', () => {
        const req = { user: { role: 'NUTRITIONIST' } };
        const middleware = authorize('AI', 'TUNING'); // NUTRITIONIST only has VIEW
        middleware(req, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should deny access if user role is missing', () => {
        const req = {};
        const middleware = authorize('AI', 'TUNING');
        middleware(req, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
});
