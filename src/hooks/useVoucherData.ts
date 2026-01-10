import * as Sentry from "@sentry/tanstackstart-react";
import { useQuery } from "@tanstack/react-query";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";

export function useVoucherData(voucherId: string) {
	const query = useQuery<VoucherData>({
		queryKey: ["voucherData", voucherId],
		queryFn: async () => {
			try {
				const result = await getVoucherData({ data: { id: voucherId } });
				return result as VoucherData;
			} catch (error) {
				Sentry.captureException(error);
				throw error;
			}
		},
		staleTime: 0, // Instantly stale
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	return query;
}
