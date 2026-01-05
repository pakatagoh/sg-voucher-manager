import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-50 outline-none border-2",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground border-primary hover:bg-primary/80 active:translate-y-0.5",
				destructive:
					"bg-destructive text-white border-destructive hover:bg-destructive/80 active:translate-y-0.5",
				outline:
					"border-foreground bg-background hover:bg-foreground hover:text-background active:translate-y-0.5",
				secondary:
					"bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 active:translate-y-0.5",
				ghost:
					"border-transparent hover:border-foreground active:translate-y-0.5",
			},
			size: {
				default: "h-11 px-6 py-2",
				sm: "h-9 px-4",
				lg: "h-14 px-8",
				icon: "size-11",
				"icon-sm": "size-9",
				"icon-lg": "size-14",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
