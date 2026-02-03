import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getExpiryStatus, getExpiryBadgeClasses } from '../utils/expiryUtils';

/**
 * Component to display a color-coded expiry badge with status and icon.
 * @param {Object} props - { expiryDate }
 */
const ExpiryBadge = ({ expiryDate }) => {
    const { status, color, label, daysDiff } = getExpiryStatus(expiryDate);
    const badgeClasses = getExpiryBadgeClasses(color);

    const renderIcon = () => {
        if (status === 'Expired') return <XCircle className="w-3.5 h-3.5 mr-1" />;
        if (status === 'Expiring Soon') {
            return color === 'red' ? <Clock className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />;
        }
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
    };

    return (
        <div className="group relative inline-block">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses} transition-all duration-200`}>
                {renderIcon()}
                {label}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                {expiryDate ? `Expires: ${new Date(expiryDate).toLocaleDateString()}` : 'No expiry date set'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
};

export default ExpiryBadge;
