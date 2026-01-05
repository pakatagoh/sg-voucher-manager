import type {
	DenominationBreakdown,
	ProcessedVoucherData,
	Voucher,
	VoucherData,
} from "@/types/voucher";

/**
 * Process raw voucher data and return structured breakdown by voucher type
 */
export function processVoucherData(data: VoucherData): ProcessedVoucherData {
	const { campaign, data: voucherData } = data;

	// Group vouchers by type
	const heartlandVouchers = voucherData.vouchers.filter(
		(v) => v.type === "heartland",
	);
	const supermarketVouchers = voucherData.vouchers.filter(
		(v) => v.type === "supermarket",
	);

	// Process denomination breakdown
	const processBreakdown = (vouchers: Voucher[]): DenominationBreakdown => {
		const breakdown: DenominationBreakdown = {};

		for (const voucher of vouchers) {
			const value = voucher.voucher_value;
			if (!breakdown[value]) {
				breakdown[value] = { total: 0, unused: 0, redeemed: 0 };
			}

			breakdown[value].total++;
			if (voucher.state.trim() === "unused") {
				breakdown[value].unused++;
			} else if (voucher.state.trim() === "redeemed") {
				breakdown[value].redeemed++;
			}
		}

		return breakdown;
	};

	return {
		name: campaign.name,
		description: campaign.description,
		validityEnd: new Date(campaign.validity_end).toLocaleDateString(),
		heartlandBreakdown: processBreakdown(heartlandVouchers),
		supermarketBreakdown: processBreakdown(supermarketVouchers),
	};
}
