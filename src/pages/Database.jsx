import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, Plus, Edit2, Trash2, X, Save, ChevronLeft, Search } from 'lucide-react';
import { databaseService } from '../services/api';

const DatabasePanel = () => {
    const [stats, setStats] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Fetch database stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await databaseService.getStats();
            setStats(response.data.tables);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTableData = async (tableName) => {
        setIsTableLoading(true);
        setSelectedTable(tableName);
        try {
            const response = await databaseService.getTableData(tableName);
            setTableData(response.data.data);
            setColumns(response.data.columns);
        } catch (error) {
            console.error('Failed to fetch table data:', error);
        } finally {
            setIsTableLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({ ...record });
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setEditingRecord(null);
        // Initialize empty form based on columns
        const emptyForm = {};
        columns.forEach(col => {
            if (col !== 'id' && col !== 'createdAt' && col !== 'updatedAt') {
                emptyForm[col] = '';
            }
        });
        setFormData(emptyForm);
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (editingRecord) {
                await databaseService.updateRecord(selectedTable, editingRecord.id, formData);
            } else {
                await databaseService.createRecord(selectedTable, formData);
            }
            await fetchTableData(selectedTable);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to save:', error);
            alert(error.response?.data?.message || 'Failed to save record');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            await databaseService.deleteRecord(selectedTable, id);
            await fetchTableData(selectedTable);
        } catch (error) {
            console.error('Failed to delete:', error);
            alert(error.response?.data?.message || 'Failed to delete record');
        }
    };

    const filteredData = tableData.filter(row => {
        if (!searchQuery) return true;
        return Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const formatValue = (value, column) => {
        if (value === null || value === undefined) return '-';
        if (column === 'createdAt' || column === 'updatedAt') {
            return new Date(value).toLocaleString();
        }
        if (typeof value === 'boolean') {
            return value ? '✓ Yes' : '✗ No';
        }
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '...';
        }
        return String(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {selectedTable && (
                        <button
                            onClick={() => setSelectedTable(null)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Database className="w-6 h-6 text-purple-500" />
                            {selectedTable ? `Table: ${selectedTable}` : 'Database Panel'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {selectedTable
                                ? `Viewing ${tableData.length} records`
                                : 'Manage database tables directly'
                            }
                        </p>
                    </div>
                </div>
                <button
                    onClick={selectedTable ? () => fetchTableData(selectedTable) : fetchStats}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Table Selection View */}
            {!selectedTable && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        stats.map((table) => (
                            <button
                                key={table.model}
                                onClick={() => fetchTableData(table.model)}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-purple-300 hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <Table className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-2xl font-bold text-gray-800">{table.count}</span>
                                </div>
                                <h3 className="font-semibold text-gray-800">{table.name}</h3>
                                <p className="text-sm text-gray-500">Click to view records</p>
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Table Data View */}
            {selectedTable && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-purple-600 transition-colors flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Record
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isTableLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col} className="px-4 py-3 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length > 0 ? filteredData.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                            {columns.map((col) => (
                                                <td key={col} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                    {formatValue(row[col], col)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editingRecord ? `Edit Record #${editingRecord.id}` : 'Create New Record'}
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {columns.filter(col => col !== 'id' && col !== 'createdAt' && col !== 'updatedAt').map((col) => (
                                <div key={col}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {col.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    {col === 'isBought' ? (
                                        <select
                                            value={formData[col] ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, [col]: e.target.value === 'true' })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    ) : col === 'ingredients' || col === 'instructions' ? (
                                        <textarea
                                            value={formData[col] || ''}
                                            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                                        />
                                    ) : (
                                        <input
                                            type={['time', 'calories', 'price', 'userId'].includes(col) ? 'number' : 'text'}
                                            value={formData[col] || ''}
                                            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center justify-center disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingRecord ? 'Save Changes' : 'Create Record'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabasePanel;
