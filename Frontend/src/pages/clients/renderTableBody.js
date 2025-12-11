const renderTableBody = () => {
    if (loading) {
        return Array.from({ length: 5 }).map((_, i) => (
            <tr key={`skeleton-${i}`} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
            </tr>
        ));
    }

    if (error) {
        return (
            <tr>
                <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="text-red-600">
                        <p>Error loading clients: {error}</p>
                        <button
                            onClick={() => globalThis.location.reload()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    if (customers && customers.length > 0) {
        return customers.map((client, index) => {
            const stats = getClientStats(client.id);
            return (
                <ClientRow
                    key={client.id}
                    client={client}
                    stats={stats}
                    serialNumber={String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                    onView={handleViewClient}
                    onEdit={handleEditClient}
                    onDelete={handleDeleteClient}
                />
            );
        });
    }

    return (
        <tr>
            <td
                colSpan="8"
                className="px-4 py-8 text-center text-gray-500"
            >
                No clients found.{" "}
                {searchTerm && "Try adjusting your search criteria."}
            </td>
        </tr>
    );
};
