import { useMemo, useState } from "react";
import { ComboBox, ComboBoxItem } from "~/components/ui/ComboBox";
import { Tag, TagGroup } from "~/components/ui/TagGroup";

export interface RelatedNotesSelectorProps {
	selectedIds: string[];
	availableNotes: Array<{ id: string; title: string }>;
	currentNoteId?: string;
	onChange: (selectedIds: string[]) => void;
}

export function RelatedNotesSelector({
	selectedIds,
	availableNotes,
	currentNoteId,
	onChange,
}: RelatedNotesSelectorProps) {
	const [inputValue, setInputValue] = useState("");

	// Filter out current note and already selected notes
	const filteredNotes = useMemo(() => {
		return availableNotes.filter(
			(note) =>
				note.id !== currentNoteId &&
				!selectedIds.includes(note.id) &&
				note.title.toLowerCase().includes(inputValue.toLowerCase()),
		);
	}, [availableNotes, currentNoteId, selectedIds, inputValue]);

	// Get selected note objects for TagGroup
	const selectedNotes = useMemo(() => {
		return selectedIds
			.map((id) => availableNotes.find((note) => note.id === id))
			.filter((note): note is { id: string; title: string } => note != null);
	}, [selectedIds, availableNotes]);

	const handleSelectionChange = (key: React.Key | null) => {
		if (key && typeof key === "string") {
			onChange([...selectedIds, key]);
			setInputValue("");
		}
	};

	const handleRemove = (keys: Set<React.Key>) => {
		const removedIds = Array.from(keys) as string[];
		onChange(selectedIds.filter((id) => !removedIds.includes(id)));
	};

	return (
		<div className="flex flex-col gap-3">
			<ComboBox
				label="Related Notes"
				items={filteredNotes}
				inputValue={inputValue}
				onInputChange={setInputValue}
				onSelectionChange={handleSelectionChange}
				selectedKey={null}
				allowsEmptyCollection
				menuTrigger="focus"
			>
				{(note) => <ComboBoxItem id={note.id}>{note.title}</ComboBoxItem>}
			</ComboBox>

			{selectedNotes.length > 0 && (
				<TagGroup
					items={selectedNotes}
					onRemove={handleRemove}
					aria-label="Selected related notes"
					color="surface"
				>
					{(note) => (
						<Tag id={note.id} textValue={note.title}>
							{note.title}
						</Tag>
					)}
				</TagGroup>
			)}
		</div>
	);
}
