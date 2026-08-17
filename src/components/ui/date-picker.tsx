import { CalendarMinimalisticIcon } from "@solar-icons/react/outline/calendar-minimalistic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type DatePickerProps = {
	value?: string;
	onChange: (date: string | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
};

export function DatePicker({
	value,
	onChange,
	placeholder = "Seleccionar fecha",
	disabled,
	className,
	id,
}: DatePickerProps) {
	const [open, setOpen] = useState<boolean>(false);
	const date = value ? new Date(`${value}T00:00:00`) : undefined;
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal h-11 px-3",
						!date && "text-muted-foreground",
						className,
					)}
				>
					<CalendarMinimalisticIcon className="mr-2 size-4" />
					{date ? format(date, "PPP", { locale: es }) : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(d) => {
						onChange(d ? format(d, "yyyy-MM-dd") : undefined);
						setOpen(false);
					}}
					locale={es}
				/>
			</PopoverContent>
		</Popover>
	);
}

export default DatePicker;
