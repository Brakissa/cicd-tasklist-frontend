import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

		it('getTasks throws on HTTP error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 500,
					text: () => Promise.resolve('Server Error'),
				})
			);

			await expect(getTasks()).rejects.toThrow('HTTP 500: Server Error');
		});

		it('createTask sends POST and returns task', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(mockTask),
				})
			);

const payload = { title: 'New Task' };
			const result = await createTask(payload);

			expect(result).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		});

		it('createTask throws on error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 400,
					text: () => Promise.resolve('Bad Request'),
				})
			);

			await expect(createTask({ title: '' })).rejects.toThrow(
				'HTTP 400: Bad Request'
			);
		});

		it('updateTask sends PUT and returns updated task', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(mockTask),
				})
			);

			const payload = { title: 'Updated' };
			const result = await updateTask(1, payload);

			expect(result).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		});

		it('updateTask throws on error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					text: () => Promise.resolve('Not Found'),
				})
			);

			await expect(updateTask(999, { title: 'Test' })).rejects.toThrow(
				'HTTP 404: Not Found'
			);
		});

		it('deleteTask sends DELETE request', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
				})
			);

			await deleteTask(1);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
				method: 'DELETE',
			});
		});

		it('deleteTask throws on error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					text: () => Promise.resolve('Not Found'),
				})
			);

			await expect(deleteTask(999)).rejects.toThrow('HTTP 404: Not Found');
		});});