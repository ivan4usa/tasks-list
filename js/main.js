const USER_ID = '3015512';
const server = 'https://tasks-list-backend.herokuapp.com/'
const el_tasks_list = document.getElementById('tasksList');
const el_taskForm = document.getElementById('taskForm');
const el_taskInput = document.getElementById('taskInput');
const el_spinner = document.getElementById('spinner');
let is_tasksList_loaded = false;


function toggleSpinner(action) {
	if (action === 'stop') {
		el_spinner.classList.contains('d-flex') ?  el_spinner.classList.remove('d-flex') : '';
		el_spinner.classList.add('d-none');
	}
	if (action === 'run') {
		el_spinner.classList.contains('d-none') ?  el_spinner.classList.remove('d-none') : '';
		!el_spinner.classList.contains('d-flex') ? el_spinner.classList.add('d-flex') : '';
	}
}

loadTaskList();

function loadTaskList() {
	toggleSpinner('run');
	getTasks(USER_ID).then(response => {
		if (response) {
			let sortedTasks = sortTasks(response);
			createTasksList(sortedTasks);
			el_taskForm.reset();
			el_taskInput.focus();
		}
	});
}

function sortTasks(tasks) {
	return tasks.sort(function(a, b){
		return new Date(b.date) - new Date(a.date);
	});
}

function postAction(event) {
	event.preventDefault();
	toggleSpinner('run');
	let task = event.target.task.value;
	if (task.trim().length > 0) {
		postNewTask(USER_ID, task).then(() => {
			loadTaskList();
		});
	}
}

async function getTasks(id) {
	let url = `${server}/api/tasks/${id}`;
	let response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert('HTTP-Error' + response.status);
	}
}

async function postNewTask(userId, task) {
	let url = `${server}/api/tasks/new`;
	let response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			'userId': userId,
			'description': task,
			'date': new Date()
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert('HTTP-Error' + response.status);
	}
}

async function deleteTask(userId, task) {
	let url = `${server}/api/tasks/delete`;
	let response = await fetch(url, {
		method: 'DELETE',
		body: JSON.stringify({
			'userId': userId,
			'description': task
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!response.ok) {
		alert('HTTP-Error' + response.status);
	}
}

function createTasksList(tasks) {
	while (el_tasks_list.firstChild) {
		el_tasks_list.firstChild.remove();
	}
	let list = document.createElement('ul');
	if (tasks) {
		tasks.forEach((task) => {
			list.innerHTML += '<li class="d-flex justify-content-start align-items-center" data-content="' +
				task.description + '"><div class="d-flex flex-column align-items-center me-4 text-gray" ' +
				'onclick="deleteAction(this.parentNode);"><i class="fs-2 fas fa-minus-circle"></i>' +
				'<span>Remove</span></div><div class="d-flex flex-column"><p>' + task.description +
				'</p><span class="fst-italic">Date: ' + getDateFormat(task.date) ?? 'no date' + '</span></div></li>';
		});
	}
	el_tasks_list.append(list);
	toggleSpinner('stop');
}

function deleteAction(element) {
	toggleSpinner('run');
	let task = element.getAttribute('data-content');
	deleteTask(USER_ID, task).then(() => {
		loadTaskList();
	});
}

function getDateFormat(date) {
	if (!date) {
		return;
	}
	date = new Date(date);
	return (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
}
