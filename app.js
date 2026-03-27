const form = document.getElementById('todo-form');
const descriptionInput = document.getElementById('description');
const tagsInput = document.getElementById('tags');
const scheduleAInput = document.getElementById('scheduleA');
const scheduleBInput = document.getElementById('scheduleB');
const errorField = document.getElementById('form-error');
const itemsList = document.getElementById('items');
const fieldErrors = {
  description: document.getElementById('description-error'),
  tags: document.getElementById('tags-error'),
  scheduleA: document.getElementById('scheduleA-error'),
  scheduleB: document.getElementById('scheduleB-error'),
};

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
  Object.values(fieldErrors).forEach((fieldError) => {
    fieldError.textContent = '';
  });
  [descriptionInput, tagsInput, scheduleAInput, scheduleBInput].forEach((input) => {
    input.removeAttribute('aria-invalid');
  });

  const formData = new FormData(form);
  const { tags, duplicates } = parseAndValidateTags(tagsInput.value);
  const description = formData.get('description')?.toString().trim() || '';
  const scheduleA = formData.get('scheduleA')?.toString().trim() || '';
  const scheduleB = formData.get('scheduleB')?.toString().trim() || '';
  const validationErrors = [];

  if (description.length < 10) {
    fieldErrors.description.textContent = 'Description must be at least 10 characters long.';
    descriptionInput.setAttribute('aria-invalid', 'true');
    validationErrors.push('Description must be at least 10 characters long.');
  }

  if (tags.length < 1) {
    fieldErrors.tags.textContent = 'Add at least one tag.';
    tagsInput.setAttribute('aria-invalid', 'true');
    validationErrors.push('Add at least one tag.');
  }

  if (duplicates.length > 0) {
    const duplicateMessage = `Duplicate tags are not allowed: ${duplicates.join(', ')}`;
    fieldErrors.tags.textContent = duplicateMessage;
    tagsInput.setAttribute('aria-invalid', 'true');
    validationErrors.push(duplicateMessage);
  }

  if (!scheduleA) {
    fieldErrors.scheduleA.textContent = 'Schedule A is required.';
    scheduleAInput.setAttribute('aria-invalid', 'true');
    validationErrors.push('Schedule A is required.');
  }

  if (!scheduleB) {
    fieldErrors.scheduleB.textContent = 'Schedule B is required.';
    scheduleBInput.setAttribute('aria-invalid', 'true');
    validationErrors.push('Schedule B is required.');
  }

  if (validationErrors.length > 0) {
    errorField.textContent = 'Please fix the highlighted errors and submit again.';
    return;
  }

  const item = {
    description,
    tags,
    scheduleA,
    scheduleB,
  };

  const li = document.createElement('li');
  li.textContent = `${item.description} | tags: ${item.tags.join(', ')} | schedule A: ${item.scheduleA} | schedule B: ${item.scheduleB}`;
  itemsList.prepend(li);

  form.reset();
});
