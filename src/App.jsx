import React, { useEffect, useRef, useState } from 'react';
import {
  Check, Circle, CircleCheck, ClipboardList, Fish, ListChecks, PencilLine,
  Plus, Search, Trash2, X,
} from 'lucide-react';
import { loadTasks, saveTasks } from './tasks.js';

const filters = [
  { id: 'all', label: 'Все задачи', icon: ClipboardList, empty: 'Список задач пуст' },
  { id: 'active', label: 'Активные', icon: Circle, empty: 'Активных задач пока нет' },
  { id: 'complete', label: 'Выполненные', icon: CircleCheck, empty: 'Выполненных задач пока нет' },
];

function matchesFilter(task, filter) {
  return filter === 'all' || task.complete === (filter === 'complete');
}

function TaskRow({ task, removing, onToggle, onDelete, onExit }) {
  return (
    <li
      className={`task-row${removing ? ' is-removing' : ''}`}
      aria-hidden={removing || undefined}
      onAnimationEnd={(event) => {
        if (removing && event.target === event.currentTarget) onExit(task.id);
      }}
    >
      <div className="task-row-inner">
        <label className="task-label">
          <input
            className="task-checkbox"
            type="checkbox"
            checked={task.complete}
            disabled={removing}
            onChange={() => onToggle(task.id)}
          />
          <span className="check-icon" aria-hidden="true"><Check size={15} /></span>
          <span className="task-text">{task.text}</span>
        </label>
        <button
          className="icon-button delete-button"
          type="button"
          aria-label={`Удалить задачу: ${task.text}`}
          disabled={removing}
          onClick={() => onDelete(task)}
        >
          <Trash2 size={19} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function Summary({ total, active, complete }) {
  const percent = total ? Math.round(complete / total * 100) : 0;
  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title"><ListChecks size={22} aria-hidden="true" /> Обзор задач</h2>
      <p>Статистика выполнения</p>
      <dl className="summary-list">
        {[
          { label: 'Всего задач', value: total, Icon: ClipboardList },
          { label: 'Осталось задач', value: active, Icon: Circle },
          { label: 'Выполнено', value: complete, Icon: CircleCheck },
        ].map(({ label, value, Icon }) => (
          <div className="summary-row" key={label}>
            <dt><span className="summary-icon"><Icon size={20} aria-hidden="true" /></span>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="progress-label"><span>Прогресс</span><strong>{percent}%</strong></div>
      <progress max={100} value={percent} aria-label="Прогресс выполнения задач" />
    </aside>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [exiting, setExiting] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const searchInput = useRef(null);
  const draftInput = useRef(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const active = tasks.filter((task) => !task.complete).length;
  const counts = { all: tasks.length, active, complete: tasks.length - active };
  const matchesView = (task) => matchesFilter(task, filter)
    && task.text.toLocaleLowerCase('ru').includes(normalizedQuery);
  const visibleTasks = tasks.filter(matchesView);
  const displayRows = visibleTasks.map((task) => ({ task, removing: false }));
  for (const { task, position } of exiting) {
    displayRows.splice(position, 0, { task, removing: true });
  }

  useEffect(() => saveTasks(tasks), [tasks]);

  function chooseFilter(nextFilter) {
    setFilter(nextFilter);
    setExiting([]);
  }

  function changeQuery(nextQuery) {
    setQuery(nextQuery);
    setExiting([]);
  }

  function addTask(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const task = { id: crypto.randomUUID(), text, complete: false };
    setTasks((current) => [task, ...current]);
    chooseFilter('all');
    changeQuery('');
    setDraft('');
    setNotice(`Задача добавлена: ${text}`);
    draftInput.current.focus();
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => (
      task.id === id ? { ...task, complete: !task.complete } : task
    )));
  }

  function removeTask(task) {
    const position = displayRows.findIndex((row) => row.task.id === task.id);
    // Keep the departing row visible during its animation while saving its removal immediately.
    setExiting((current) => [...current, { task, position }]);
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setNotice(`Задача удалена: ${task.text}`);
    draftInput.current.focus({ preventScroll: true });
  }

  function finishExit(id) {
    setExiting((current) => current.filter(({ task }) => task.id !== id));
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#tasks" onClick={() => { chooseFilter('all'); changeQuery(''); }}>
            <Fish size={36} aria-hidden="true" />
            <span>Клёв <span>Задачник</span></span>
          </a>
          <div className="search" role="search">
            <input
              type="search"
              ref={searchInput}
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Поиск по задачам"
              aria-label="Поиск по задачам"
            />
            {query ? (
              <button
                className="icon-button search-clear"
                type="button"
                aria-label="Очистить поиск"
                onClick={() => { changeQuery(''); searchInput.current.focus(); }}
              >
                <X size={21} aria-hidden="true" />
              </button>
            ) : <Search size={21} aria-hidden="true" />}
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="side-nav" aria-label="Разделы списка задач">
          {filters.map(({ id, icon: Icon, label }) => (
            <button
              className="nav-item"
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => chooseFilter(id)}
            >
              <Icon size={24} aria-hidden="true" />
              <span>{label}</span>
              <span className="nav-count" aria-hidden="true">{counts[id]}</span>
            </button>
          ))}
        </aside>

        <main className="workspace" id="tasks">
          <h1>Задачи</h1>
          <form className="composer" onSubmit={addTask}>
            <span className="composer-icon"><PencilLine size={24} aria-hidden="true" /></span>
            <input
              ref={draftInput}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Что нужно сделать?"
              aria-label="Новая задача"
            />
            <button className="add-button" type="submit" disabled={!draft.trim()}>
              <Plus size={20} aria-hidden="true" />
              <span>Добавить</span>
            </button>
          </form>

          <div className="toolbar">
            <div className="filters" role="group" aria-label="Фильтр задач">
              {filters.map(({ id, label }) => (
                <button key={id} type="button" aria-pressed={filter === id} onClick={() => chooseFilter(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <section className="task-panel" aria-labelledby="list-title">
            <div className="panel-heading">
              <h2 id="list-title"><ListChecks size={21} aria-hidden="true" /> Список задач</h2>
              <span>Осталось задач: <strong>{active}</strong></span>
            </div>
            {displayRows.length > 0 ? (
              <ul className="task-list">
                {displayRows.map(({ task, removing }) => (
                  <TaskRow key={task.id} task={task} removing={removing}
                    onToggle={toggleTask} onDelete={removeTask} onExit={finishExit} />
                ))}
              </ul>
            ) : (
              <div className="empty">
                <ClipboardList size={28} aria-hidden="true" />
                <p>{normalizedQuery ? 'По вашему запросу ничего не найдено' : filters.find(({ id }) => id === filter).empty}</p>
              </div>
            )}
          </section>
          <span className="visually-hidden" role="status">{notice}</span>
        </main>

        <Summary total={counts.all} active={active} complete={counts.complete} />
      </div>
    </>
  );
}
