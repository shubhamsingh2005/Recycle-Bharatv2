import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useCollector = () => {
    const queryClient = useQueryClient();

    // Fetch Assigned Pickups
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ['collector-assignments'],
        queryFn: async () => {
            const res = await api.get('/collector/assignments');
            return res.data.map(a => ({
                _id: a.id,
                ...a, // Keep other fields
                model: a.model,
                description: `${a.brand} ${a.device_type}`,
                uid: a.device_type === 'Legacy' ? 'LEGACY' : 'REGULATED', // Mock or real UID
                // Actually API returns d.device_type, d.brand...
                // Need to ensure UI gets what it needs.
                // Dashboard uses: task.model, task.description, task.uid, task.ownerId.email
                ownerId: { email: a.pickup_address } // Hack to show address where email is expected
            }));
        },
        refetchInterval: 5000
    });

    // Fetch Job History
    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['collector-history'],
        queryFn: async () => {
            const res = await api.get('/collector/history');
            return res.data.map(h => ({
                _id: h.id,
                uid: h.device_uid,
                currentDuc: h.device_uid,
                model: h.model,
                updatedAt: h.actual_pickup_time,
                status: h.current_state
            }));
        },
        refetchInterval: 5000
    });

    // Confirm Pickup
    const pickupMutation = useMutation({
        mutationFn: async ({ assignmentId, verification_metadata }) => {
            const res = await api.post(`/collector/assignments/${assignmentId}/pickup`, { verification_metadata });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['collector-assignments']);
            queryClient.invalidateQueries(['collector-history']);
        },
    });

    // Confirm Delivery
    const deliverMutation = useMutation({
        mutationFn: async (assignmentId) => {
            const res = await api.post(`/collector/assignments/${assignmentId}/deliver`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['collector-assignments']);
            queryClient.invalidateQueries(['collector-history']);
        },
    });

    return {
        assignments,
        history,
        isLoading,
        isHistoryLoading,
        error,
        confirmPickup: pickupMutation.mutateAsync,
        isConfirmingPickup: pickupMutation.isPending,
        confirmDelivery: deliverMutation.mutateAsync,
        isConfirmingDelivery: deliverMutation.isPending,
    };
};
