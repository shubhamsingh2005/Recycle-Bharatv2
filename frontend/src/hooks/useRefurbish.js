import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useRefurbish = () => {
    const queryClient = useQueryClient();

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['refurbish-jobs'],
        queryFn: async () => {
            const res = await api.get('/refurbish/jobs');
            return res.data;
        },
        refetchInterval: 5000
    });

    const { data: agents } = useQuery({
        queryKey: ['refurbish-agents'],
        queryFn: async () => {
            const res = await api.get('/refurbish/agents');
            return res.data;
        }
    });

    const { data: recyclers } = useQuery({
        queryKey: ['public-recyclers'],
        queryFn: async () => {
            const res = await api.get('/public/recyclers');
            return res.data;
        }
    });

    const verifyPickup = useMutation({
        mutationFn: async ({ deviceId, pickupCode }) => {
            const res = await api.post('/refurbish/verify-pickup', { deviceId, pickupCode });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    const submitProposal = useMutation({
        mutationFn: async (proposalData) => {
            const res = await api.post('/refurbish/proposal', proposalData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    const acceptJob = useMutation({
        mutationFn: async ({ deviceId }) => {
            const res = await api.post('/refurbish/accept-job', { deviceId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    const assignAgent = useMutation({
        mutationFn: async ({ deviceId, agentId }) => {
            const res = await api.post('/refurbish/assign-agent', { deviceId, agentId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    const confirmArrival = useMutation({
        mutationFn: async ({ deviceId, pickupCode }) => {
            const res = await api.post('/refurbish/confirm-arrival', { deviceId, pickupCode });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    const requestWasteHandover = useMutation({
        mutationFn: async ({ deviceId, recyclerId }) => {
            const res = await api.post('/refurbish/waste-handover', { deviceId, recyclerId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refurbish-jobs'] });
        }
    });

    return {
        jobs,
        agents,
        recyclers,
        isLoading,
        acceptJob: acceptJob.mutateAsync,
        isAccepting: acceptJob.isPending,
        assignAgent: assignAgent.mutateAsync,
        isAssigning: assignAgent.isPending,
        verifyPickup: verifyPickup.mutateAsync,
        isVerifying: verifyPickup.isPending,
        confirmArrival: confirmArrival.mutateAsync,
        isConfirmingArrival: confirmArrival.isPending,
        submitProposal: submitProposal.mutateAsync,
        isSubmittingProposal: submitProposal.isPending,
        requestWasteHandover: requestWasteHandover.mutateAsync,
        isRequestingWaste: requestWasteHandover.isPending
    };
};
