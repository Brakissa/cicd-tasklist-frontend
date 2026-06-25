import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Test Task',
	description: 'Test Description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title', () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		expect(screen.getByText('Test Task')).toBeInTheDocument();
		expect(screen.getByText('Test Description')).toBeInTheDocument();
	});

	it('toggles completed state', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const checkbox = screen.getByRole('checkbox');
		await userEvent.click(checkbox);
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode on edit button click', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByLabelText('Modifier');
		await userEvent.click(editButton);

		expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
	});

	it('saves edited task', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByLabelText('Modifier');
		await userEvent.click(editButton);

		const titleInput = screen.getByDisplayValue('Test Task') as HTMLInputElement;
		await userEvent.clear(titleInput);
		await userEvent.type(titleInput, 'Updated Task');

		const saveButton = screen.getByRole('button', { name: 'Enregistrer' });
		await userEvent.click(saveButton);

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Updated Task',
			description: 'Test Description',
		});
	});

	it('does not save if title is empty', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByLabelText('Modifier');
		await userEvent.click(editButton);

		const titleInput = screen.getByDisplayValue('Test Task') as HTMLInputElement;
		await userEvent.clear(titleInput);

		const saveButton = screen.getByRole('button', { name: 'Enregistrer' });
		await userEvent.click(saveButton);

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit mode', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByLabelText('Modifier');
		await userEvent.click(editButton);

		const titleInput = screen.getByDisplayValue('Test Task') as HTMLInputElement;
		await userEvent.clear(titleInput);
		await userEvent.type(titleInput, 'Changed');

		const cancelButton = screen.getByRole('button', { name: 'Annuler' });
		await userEvent.click(cancelButton);

		expect(screen.getByText('Test Task')).toBeInTheDocument();
		expect(onEdit).not.toHaveBeenCalled();
	});

	it('shows delete confirmation on first click', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const deleteButton = screen.getByLabelText('Supprimer');
		expect(deleteButton.textContent).toBe('🗑️');

		await userEvent.click(deleteButton);

		expect(deleteButton.textContent).toBe('⚠️');
		expect(onDelete).not.toHaveBeenCalled();
	});

	it('deletes task on second click', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const deleteButton = screen.getByLabelText('Supprimer');
		await userEvent.click(deleteButton);
		await userEvent.click(deleteButton);

		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('renders completed task with proper styling', () => {
		const completedTask: Task = { ...mockTask, completed: true };
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		const { container } = render(
			<TaskItem
				task={completedTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const taskItem = container.querySelector('.task-item');
		expect(taskItem).toHaveClass('task-completed');
	});

	it('renders task without description', () => {
		const taskWithoutDesc: Task = { ...mockTask, description: null };
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={taskWithoutDesc}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		expect(screen.getByText('Test Task')).toBeInTheDocument();
		expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
	});

	it('clears description when editing', async () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskItem
				task={mockTask}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByLabelText('Modifier');
		await userEvent.click(editButton);

		const descInput = screen.getByDisplayValue('Test Description') as HTMLTextAreaElement;
		await userEvent.clear(descInput);

		const saveButton = screen.getByRole('button', { name: 'Enregistrer' });
		await userEvent.click(saveButton);

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Test Task',
			description: undefined,
		});
	});
});
