import { useQuery } from "@tanstack/react-query";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";

export function useVoucherData(voucherId: string) {
	const query = useQuery<VoucherData>({
		queryKey: ["voucherData", voucherId],
		queryFn: async () => {
			const result = await getVoucherData({ data: { id: voucherId } });
			return result as VoucherData;
		},
		staleTime: 0, // Instantly stale
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
