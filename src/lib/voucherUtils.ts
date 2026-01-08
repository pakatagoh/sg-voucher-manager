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

	// Determine if this is a climate voucher campaign based on category
	const isClimateVoucherCampaign = campaign.category === "nea_cfhp";

	// Group vouchers by type
	// Climate voucher campaigns contain only climate vouchers
	// CDC voucher campaigns contain heartland and/or supermarket vouchers
	const heartlandVouchers = voucherData.vouchers.filter(
		(v) => v.type === "heartland",
	);

	const supermarketVouchers = voucherData.vouchers.filter(
		(v) => v.type === "supermarket",
	);
	const climateVouchers = isClimateVoucherCampaign ? voucherData.vouchers : [];

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
		climateBreakdown: processBreakdown(climateVouchers),
	};
}
