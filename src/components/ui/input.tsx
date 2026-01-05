import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"placeholder:text-muted-foreground h-11 w-full border-2 border-foreground bg-background px-4 py-2 text-base transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary focus:shadow-[4px_4px_0_0_oklch(0.55_0.15_240)]",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
