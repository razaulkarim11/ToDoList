const form = document.getElementById('todo-form');
const tagsInput = document.getElementById('tags');
const errorField = document.getElementById('form-error');
const itemsList = document.getElementById('items');

function parseAndValidateTags(rawTags) {
  const normalizedTags = rawTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());

  const seen = new Set();
  const duplicates = [];

  normalizedTags.forEach((tag) => {
    if (seen.has(tag) && !duplicates.includes(tag)) {
      duplicates.push(tag);
    }
    seen.add(tag);
  });

  return {
    tags: normalizedTags,
    duplicates,
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorField.textContent = '';

  const formData = new FormData(form);
  const { tags, duplicates } = parseAndValidateTags(tagsInput.value);

  if (duplicates.length > 0) {
    errorField.textContent = `Duplicate tags are not allowed: ${duplicates.join(', ')}`;
    return;
  }

  const item = {
    task: formData.get('task')?.toString().trim(),
    tags,
    timeSpent: formData.get('timeSpent')?.toString().trim() || '0',
    futureSchedule: formData.get('futureSchedule')?.toString().trim() || 'Not scheduled',
  };

  const li = document.createElement('li');
  li.textContent = `${item.task} | tags: ${item.tags.join(', ') || 'none'} | time spent: ${item.timeSpent}h | future schedule: ${item.futureSchedule}`;
  itemsList.prepend(li);

  form.reset();
});
