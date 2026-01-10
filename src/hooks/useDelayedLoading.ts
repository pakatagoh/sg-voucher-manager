import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delay = 250): boolean {
	const [showSpinner, setShowSpinner] = useState(false);

	useEffect(() => {
		if (isLoading) {
			const timer = setTimeout(() => {
				setShowSpinner(true);
			}, delay);

			return () => clearTimeout(timer); // Cancel timer if loading finishes early
		}
		setShowSpinner(false);
	}, [isLoading, delay]);

	return showSpinner;
}
