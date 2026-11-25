const storageKey = 'klevliga.tasks.v1';

const exampleTasks = [
  { id: 'example-1', text: 'Проверить прогноз на выходные', complete: false },
  { id: 'example-2', text: 'Подготовить снасти к рыбалке', complete: false },
  { id: 'example-3', text: 'Выбрать водоём для поездки', complete: false },
  { id: 'example-4', text: 'Составить список вещей', complete: true },
  { id: 'example-5', text: 'Зарядить фонарь', complete: true },
];

export function loadTasks() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) return exampleTasks;
    const tasks = JSON.parse(stored);
    if (Array.isArray(tasks)) {
      return tasks.filter((task) => task
        && typeof task.id === 'string'
        && typeof task.text === 'string'
        && typeof task.complete === 'boolean');
    }
  } catch {
    // The task list remains usable if storage is unavailable or unreadable.
  }
  return exampleTasks;
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {
    // The current list is still available in React state.
  }
}
