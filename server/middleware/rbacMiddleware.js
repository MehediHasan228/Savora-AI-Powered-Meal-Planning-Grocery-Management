/**
 * RBAC Middleware
 * Defines roles and permissions for the enterprise admin panel
 */

const ROLE_PERMISSIONS = {
    'SUPER_ADMIN': {
        'USERS': ['VIEW', 'EDIT', 'DELETE', 'BAN'],
        'CONTENT': ['VIEW', 'EDIT', 'DELETE'],
        'AI': ['VIEW', 'TUNING', 'OVERRIDE'],
        'SYSTEM': ['VIEW', 'LOGS', 'SETTINGS'],
        'NOTIFICATIONS': ['VIEW', 'BROADCAST']
    },
    'ADMIN': {
        'USERS': ['VIEW', 'EDIT'],
        'CONTENT': ['VIEW', 'EDIT'],
        'AI': ['VIEW', 'TUNING'],
        'SYSTEM': ['VIEW', 'LOGS'],
        'NOTIFICATIONS': ['VIEW', 'BROADCAST']
    },
    'NUTRITIONIST': {
        'CONTENT': ['VIEW', 'EDIT'],
        'AI': ['VIEW'],
        'NOTIFICATIONS': ['VIEW']
    },
    'SUPPORT': {
        'USERS': ['VIEW'],
        'CONTENT': ['VIEW'],
        'NOTIFICATIONS': ['VIEW']
    },
    'ANALYST': {
        'USERS': ['VIEW'],
        'CONTENT': ['VIEW'],
        'AI': ['VIEW'],
        'SYSTEM': ['VIEW'],
        'NOTIFICATIONS': ['VIEW']
    }
};

const authorize = (module, action) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authorized, user role missing' });
        }
        const userRole = req.user.role.toUpperCase();

        // Super Admin bypass
        if (userRole === 'SUPER_ADMIN') return next();

        const permissions = ROLE_PERMISSIONS[userRole];

        if (!permissions || !permissions[module] || !permissions[module].includes(action)) {
            return res.status(403).json({
                message: `Access Denied: Role '${userRole}' does not have permission to ${action} in ${module}.`
            });
        }

        next();
    };
};

module.exports = { authorize, ROLE_PERMISSIONS };
