import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create mode by default', () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Titre de la tâche *')).toBeInTheDocument();
	});

	it('renders edit mode when specified', () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} mode="edit" />);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
	});

	it('initializes with provided values in edit mode', () => {
		const onSubmit = vi.fn();
		const initialValues = { title: 'Test Task', description: 'Test Description' };

		render(
			<TaskForm
				onSubmit={onSubmit}
				initialValues={initialValues}
				mode="edit"
			/>
		);

		expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
	});

	it('submits form with valid data', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		const descInput = screen.getByPlaceholderText('Description (optionnel)');
		const submitButton = screen.getByRole('button', { name: 'Ajouter' });

		await userEvent.type(titleInput, 'New Task');
		await userEvent.type(descInput, 'New Description');
		await userEvent.click(submitButton);

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'New Task',
			description: 'New Description',
		});
	});

	it('shows validation error when title is empty', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('shows validation error when title is only whitespace', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		await userEvent.type(titleInput, '   ');

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('clears validation error when user types', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(screen.getByText('Le titre est requis')).toBeInTheDocument();

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		await userEvent.type(titleInput, 'Task');

		expect(screen.queryByText('Le titre est requis')).not.toBeInTheDocument();
	});

	it('clears form after submit in create mode', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} mode="create" />);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *') as HTMLInputElement;
		const descInput = screen.getByPlaceholderText('Description (optionnel)') as HTMLTextAreaElement;

		await userEvent.type(titleInput, 'New Task');
		await userEvent.type(descInput, 'Description');

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(titleInput.value).toBe('');
		expect(descInput.value).toBe('');
	});

	it('does not clear form after submit in edit mode', async () => {
		const onSubmit = vi.fn();
		const initialValues = { title: 'Test', description: 'Desc' };

		render(
			<TaskForm
				onSubmit={onSubmit}
				mode="edit"
				initialValues={initialValues}
			/>
		);

		const titleInput = screen.getByDisplayValue('Test') as HTMLInputElement;
		await userEvent.clear(titleInput);
		await userEvent.type(titleInput, 'Updated');

		const submitButton = screen.getByRole('button', { name: 'Modifier' });
		await userEvent.click(submitButton);

		expect(titleInput.value).toBe('Updated');
	});

	it('trims whitespace from title and description', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		const descInput = screen.getByPlaceholderText('Description (optionnel)');

		await userEvent.type(titleInput, '  Task  ');
		await userEvent.type(descInput, '  Description  ');

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Task',
			description: 'Description',
		});
	});

	it('converts empty description to undefined', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		await userEvent.type(titleInput, 'Task');

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Task',
			description: undefined,
		});
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const onSubmit = vi.fn();
		const onCancel = vi.fn();

		render(<TaskForm onSubmit={onSubmit} onCancel={onCancel} />);

		const cancelButton = screen.getByRole('button', { name: 'Annuler' });
		await userEvent.click(cancelButton);

		expect(onCancel).toHaveBeenCalled();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('applies error class to input when validation error exists', async () => {
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		const submitButton = screen.getByRole('button', { name: 'Ajouter' });
		await userEvent.click(submitButton);

		const titleInput = screen.getByPlaceholderText('Titre de la tâche *');
		expect(titleInput).toHaveClass('input-error');
	});
});
