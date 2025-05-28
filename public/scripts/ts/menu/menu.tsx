import { useEffect } from 'react';
import type { Sound, SoundListWithSize } from '../../../types/sound'
import { updatePagination } from '../pagination';
import { soundList } from '../soundList';
import { fetchSounds, SoundList } from '../../newSoundList';

export function useUIInteractions() {
  useEffect(() => {
    const minSlider = document.getElementById('minDuration') as HTMLInputElement | null
    const maxSlider = document.getElementById('maxDuration') as HTMLInputElement | null
    const bpmSlider = document.getElementById('bpmSlider') as HTMLInputElement | null

    const minSliderValue = "0"
    const maxSliderValue = "600"

    if (minSlider && maxSlider && bpmSlider) {
      // Duration
      minSlider.value = minSliderValue
      maxSlider.value = maxSliderValue
      minSlider.addEventListener('input', () => updateDurationDisplay(true))
      maxSlider.addEventListener('input', () => updateDurationDisplay(true))
      updateDurationDisplay(false)

      // BPM
      bpmSlider.value = "0"
      bpmSlider.addEventListener('input', () => updateBpmDisplay(true))
      updateBpmDisplay(false)

      // Tag Menu
      //openCloseButtons('menuWrapper')

      const categoryDataName = 'categories'
      const hasDurationProgressiveBar = true

      loadMenuItems(
        'categoryBackButton',
        categoryRootItems,
        categoryMenuData,
        'categoryMenuContainer',
        categorySelectedItems,
        categoryNavigationStack,
        categoryCurrentItems,
        'category',
        categoryDataName,
        'selectedItemsContainer',
        'categoryBackButtonContainer',
        1,
        hasDurationProgressiveBar
      )

      dropDownMenu(
        1,
        'toggleInstruments',
        'instrumentDropdown',
        'instrumentList',
        'instruments'
      )

      menuSubmit('menuSubmitDiv')
    }

    // clean up (opsiyonel)
    return () => {
      minSlider?.removeEventListener('input', () => updateDurationDisplay(true))
      maxSlider?.removeEventListener('input', () => updateDurationDisplay(true))
      bpmSlider?.removeEventListener('input', () => updateBpmDisplay(true))
    }
  }, [])
}

interface CategoryItem {
  tag: string;
  name: string;
  source: string;
}

function dropDownMenu(page = 1, toggleBtnID: string, dropdownID: string, listID: string, dataName: string) {
  fetch(`http://localhost:8083/allMetaData?page=${page}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Menu loading error');
      }
      return response.json();
    })
    .then(data => {
      const items = data[dataName]
      if (items) {
        const toggleBtn = document.getElementById(toggleBtnID);
        const dropdown = document.getElementById(dropdownID);
        const list = document.getElementById(listID);

        if (toggleBtn && dropdown) {
          toggleBtn.addEventListener('click', () => {
            //const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
            const isHidden = getComputedStyle(dropdown).display === 'none';
            dropdown.style.display = isHidden ? 'block' : 'none';
          });
        }

        items.forEach((item: CategoryItem, index: number) => {
          const label = document.createElement('label');

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.dataset.tag = item.tag;

          const sourceItem = {
            tag: item.tag,
            name: item.name,
            source: 'instrument'
          }
          checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const isChecked = target.checked;

            if (isChecked) {
              categorySelectedItems.add(sourceItem)
            } else {
              deleteItemByTag(item.tag, categorySelectedItems)
            }
            updateSelectedItems('selectedItemsContainer', categorySelectedItems);
          });

          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(item.name));
          list?.appendChild(label);
        });
      }
    })
}

function loadMenuItems(clearButtonName: string, rootItems: any[], items: any[], menuContainerID: string, selectedItems: Set<any>, navigationStack: any[], currentItems: any[], metaDataName: string, dataName: string, selectedItemsContainer: string, backButtonID: string, page: number, hasDurationProgressiveBar: boolean) {
  fetch(`http://localhost:8083/allMetaData?page=${page}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Menu loading error');
      }
      return response.json();
    })
    .then(data => {
      const searchInput = document.getElementById('categorySearchInput');
      const clearSelection = document.getElementById('categoryClearSelection');

      if (searchInput) {
        searchInput.addEventListener('input', (event) => {
          filterMenu('categorySearchInput', 'categoryMenuContainer')
        });
      }

      if (clearSelection) {
        clearSelection.addEventListener('click', (event) => {
          clearAllSelections('selectedItemsContainer', categorySelectedItems, true)
        });
      }

      items = data[dataName];
      rootItems = data[dataName];
      renderMenu(clearButtonName, rootItems, items, menuContainerID, selectedItems, navigationStack, items, metaDataName, dataName, selectedItemsContainer, backButtonID, 'category');
    });
}

export let isBpmChanged = false;
export let isDurationChanged = false;
const minSliderValue = 0
const maxSliderValue = 600

let categoryMenuData: CategoryItem[] = [];
export let categorySelectedItems = new Set<CategoryItem>();
let categoryNavigationStack: any[] = [];
let categoryCurrentItems: any[] = [];
let categoryRootItems: any[] = [];

export function parseTimeRange(rangeStr: string) {
  const [minStr, maxStr] = rangeStr.split("-");

  function toSeconds(timeStr: string) {
    const [min, sec] = timeStr.split(":").map(Number);
    return (min * 60) + sec;
  }

  const minSeconds = toSeconds(minStr);
  const maxSeconds = toSeconds(maxStr);

  return { minSeconds, maxSeconds };
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes + ':' + secs.toString().padStart(2, '0');
}

function updateDurationDisplay(durationChanges: boolean) {
  const minSlider = document.getElementById('minDuration');
  const maxSlider = document.getElementById('maxDuration');
  const durationOutputText = document.getElementById('durationOutput');
  if (minSlider && maxSlider) {
    let min = parseInt((minSlider as HTMLInputElement).value);
    let max = parseInt((maxSlider as HTMLInputElement).value);

    if (min > max) {
      [(minSlider as HTMLInputElement).value, (maxSlider as HTMLInputElement).value] = [max.toString(), min.toString()];
      [min, max] = [max, min];
    }

    if (durationOutputText) {
      durationOutputText.textContent = formatDuration(min) + '-' + formatDuration(max);
    }

    isDurationChanged = durationChanges === true
    if (isDurationChanged && durationOutputText && durationOutputText.textContent) {
      updateSelected('duration', durationOutputText.textContent, isDurationChanged)
    }
  }
}

function resetDuration() {
  const minSlider = document.getElementById('minDuration');
  const maxSlider = document.getElementById('maxDuration');
  const durationOutputText = document.getElementById('durationOutput');
  if (minSlider && maxSlider) {
    (minSlider as HTMLInputElement).value = minSliderValue.toString();
    (maxSlider as HTMLInputElement).value = maxSliderValue.toString();
    updateDurationDisplay(false);
  }
}

function resetBpm() {
  const bpmSlider = document.getElementById('bpmSlider')
  if (bpmSlider) {
    (bpmSlider as HTMLInputElement).value = "0";
    updateBpmDisplay(false);
  }
}

function updateBpmDisplay(bpmChanges: boolean) {
  const bpmSlider = document.getElementById('bpmSlider')
  const bpmOutputText = document.getElementById('bpmOutput');
  if (bpmSlider && bpmOutputText) {
    (bpmSlider as HTMLInputElement).value;
    bpmOutputText.textContent = (bpmSlider as HTMLInputElement).value;

    isBpmChanged = bpmChanges === true

    if (isBpmChanged) {
      updateSelected('bpm', bpmOutputText.textContent, isBpmChanged)
    }
  }
}

function updateSelected(tag: string, name: string, isChanged: boolean) {
  if (isChanged) {
    const exists = [...categorySelectedItems].some(item => item.tag === tag);

    const sourceItem = {
      tag: tag,
      name: name,
      source: 'ranges'
    }

    if (!exists) {
      categorySelectedItems.add(sourceItem);
    } else {
      deleteItemByTag(tag, categorySelectedItems)
      categorySelectedItems.add(sourceItem);
    }
  } else {
    deleteItemByTag(tag, categorySelectedItems)
  }
  updateSelectedItems('selectedItemsContainer', categorySelectedItems)
}

function deleteItemByTag(tag: string, selectedItems: Set<{ tag: string }>) {
  for (const item of selectedItems) {
    if (item.tag === tag) {
      selectedItems.delete(item);
      break;
    }
  }
}

export function filterSounds(page: number, categoryTag: string | null = null, artistID: string | null = null, source: string | null = null) {
  let minDuration = null
  let maxDuration = null
  if (isDurationChanged) {
    const output = document.getElementById('durationOutput');
    if (output && output.textContent) {
      const outputResult = parseTimeRange(output.textContent);
      minDuration = outputResult.minSeconds;
      maxDuration = outputResult.maxSeconds;
    }
  }

  let bpm = null
  if (isBpmChanged) {
    const output = document.getElementById('bpmOutput');
    if (output && output.textContent) {
      bpm = parseInt(output.textContent, 10);
    }
  }

  const excludedTags = ['duration', 'bpm'];

  let instrumentSelectedTags: string[] = []
  instrumentSelectedTags = [...categorySelectedItems]
    .filter((item: { tag: string, source: string }) => !excludedTags.includes(item.tag) && item.source === 'instrument')
    .map((item: { tag: string }) => item.tag);

  let categorySelectedTags: string[] = []
  categorySelectedTags = [...categorySelectedItems]
    .filter(item => !excludedTags.includes(item.tag) && item.source === 'category')
    .map(item => item.tag);

  if (categoryTag) {
    if (source === 'instrument') {
      instrumentSelectedTags.push(categoryTag)
    } else {
      categorySelectedTags.push(categoryTag)
    }
  }

  fetch(`http://localhost:8083/database/filterSounds?page=${page}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categorySelectedTags: categorySelectedTags,
      instrumentSelectedTags: instrumentSelectedTags,
      minDuration: minDuration,
      maxDuration: maxDuration,
      bpm: bpm,
      artistID: artistID
    })
  }).then(response => {
    if (!response.ok) {
      console.log(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }).then(async data => {
    const sounds = data.sounds || [];
    const length = data.length || 0

    try {
      await soundList('soundList', sounds)
    } catch (error) {
      console.error('soundList Error:', error);
      throw error;
    }

    window.history.pushState({ page: page }, `Page ${page}`, `?page=${page}`);

    const totalPages = Math.floor((length + 10 - 1) / 10);
    updatePagination("pagination", page, totalPages, (p: number) => {
      filterSounds(p);
    });
  }).catch(error => {
    console.error("Error:", error);
  });
}

function handleClearButton(clearButtonName: string, navigationStack: any[], metaDataName: string, currentItems: any[], rootItems: any[], dataName: string, backButtonID: string, menuContainerID: string, selectedItems: Set<any>, selectedItemsContainer: string, listTypeName: string) {
  const btn = document.getElementById(clearButtonName)
  if (!btn) return

  btn.addEventListener("click", (event) => {
    setupClearButton(clearButtonName, event, navigationStack, metaDataName, currentItems, rootItems, dataName, backButtonID, menuContainerID, selectedItems, selectedItemsContainer, listTypeName);
  });
}

async function setupClearButton(clearButtonName: string, event: Event, navigationStack: any[], metaDataName: string, currentItems: any[], rootItems: any[], dataName: string, backButtonID: string, menuContainerID: string, selectedItems: Set<any>, selectedItemsContainer: string, listTypeName: string) {
  if (navigationStack.length > 0) {
    const previous = navigationStack.pop();
    if (previous && previous.tag && previous.length > 0) {
      const data = await fetchSubCategories(previous.tag, metaDataName);
      currentItems = data[dataName];
    } else {
      currentItems = rootItems;
    }

    renderMenu(clearButtonName, rootItems, currentItems, menuContainerID, selectedItems, navigationStack, currentItems, metaDataName, dataName, selectedItemsContainer, backButtonID, listTypeName);

    if (navigationStack.length === 0) {
      showBackButton(false, backButtonID);
    }
  } else {
    currentItems = rootItems;
    renderMenu(clearButtonName, rootItems, currentItems, menuContainerID, selectedItems, navigationStack, currentItems, metaDataName, dataName, selectedItemsContainer, backButtonID, listTypeName);
    showBackButton(false, backButtonID);
  }
}

export function renderMenu(clearButtonName: string, rootItems: any[], items: any[], menuContainerID: string, selectedItems: Set<any>, navigationStack: any[], currentItems: any[], metaDataName: string, dataName: string, selectedItemsContainer: string, backButtonID: string, listTypeName: string) {
  const menuContainer = document.getElementById(menuContainerID);
  if (!menuContainer) return;
  menuContainer.innerHTML = '';

  if (items) {
    items.forEach((item: any) => {
      const menuItem = createMenuItem(clearButtonName, rootItems, item, selectedItems, navigationStack, currentItems, metaDataName, dataName, selectedItemsContainer, backButtonID, menuContainerID, listTypeName);
      menuContainer?.appendChild(menuItem);
    });

    handleClearButton(clearButtonName, navigationStack, metaDataName, currentItems, rootItems, dataName, backButtonID, menuContainerID, selectedItems, selectedItemsContainer, listTypeName)
  }
}

function createMenuItem(clearButtonName: string, rootItems: any[], item: any, selectedItems: Set<any>, navigationStack: any[], currentItems: any[], metaDataName: string, dataName: string, selectedItemsContainer: string, backButtonID: string, menuContainerID: string, listTypeName: string) {
  const container = document.createElement('div');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.tag = item.tag;

  if ([...selectedItems].find(selected => selected.tag === item.tag)) {
    checkbox.checked = true
  }

  checkbox.addEventListener('change', () => {
    const sourceItem = {
      tag: item.tag,
      name: item.name,
      source: listTypeName
    }

    if (checkbox.checked) {
      selectedItems.add(sourceItem);
    } else {
      deleteItemByTag(item.tag, selectedItems)
    }
    updateSelectedItems(selectedItemsContainer, selectedItems);
  });

  const label = document.createElement('span');
  label.textContent = item.name;

  container.appendChild(checkbox);
  container.appendChild(label);

  container.addEventListener('click', async (e) => {
    if (e.target !== checkbox) {
      const hasSub = await checkIfHasSubCategory(item.tag);
      if (hasSub) {
        navigationStack.push({
          tag: item.tag,
          parentName: item.name
        });
        const subCategories = await fetchSubCategories(item.tag, metaDataName);
        currentItems = subCategories[dataName];
        renderMenu(clearButtonName, rootItems, currentItems, menuContainerID, selectedItems, navigationStack, currentItems, metaDataName, dataName, selectedItemsContainer, backButtonID, listTypeName);
        showBackButton(true, backButtonID);
      }
    }
  });

  return container;
}

function showBackButton(show: boolean, backButtonID: string) {
  const backButtonContainer = document.getElementById(backButtonID) as HTMLElement;
  if (backButtonContainer) {
    backButtonContainer.style.display = show ? 'block' : 'none';
  }
}

function updateSelectedItems(selectedItemsContainer: string, selectedItems: Set<{ tag: string, name: string }>) {
  const selectedContainer = document.getElementById(selectedItemsContainer);
  if (selectedContainer) {
    selectedContainer.innerHTML = '';
  }

  for (let selected of selectedItems) {
    const selectedTag = selected.tag;
    const selectedName = selected.name;

    const item = document.createElement('div');

    const tagName = document.createElement('span');
    tagName.textContent = selectedName;

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      if (selected.tag === 'bpm') {
        resetBpm()
      }
      if (selected.tag === 'duration') {
        resetDuration()
      }
      selectedItems.delete(selected);
      uncheckCheckbox(selectedTag);
      updateSelectedItems(selectedItemsContainer, selectedItems);
    });

    item.appendChild(tagName);
    item.appendChild(removeBtn);
    selectedContainer?.appendChild(item);
  }
}

function uncheckCheckbox(tag: string) {
  const checkbox = document.querySelector(`input[type="checkbox"][data-tag="${tag}"]`) as HTMLInputElement;
  if (checkbox) {
    checkbox.checked = false;
  }
}

async function checkIfHasSubCategory(tag: string) {
  const response = await fetch('http://localhost:8083/database/checkMetaDataSubCategory', {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `key=${encodeURIComponent(tag)}`
  });
  const result = await response.json();
  return result === true;
}

async function fetchSubCategories(tag: string, metaDataName: string) {
  const response = await fetch(`http://localhost:8083/database/getMetaDataSubCategory/${tag}/${metaDataName}`, {
    headers: { 'Accept': 'application/json' }
  });
  return await response.json();
}

export function clearAllSelections(selectedItemsContainer: string, selectedItems: Set<{ tag: string, name: string }>, hasDurationProgressiveBar: boolean) {
  selectedItems.clear();
  if (hasDurationProgressiveBar) {
    resetDuration()
    resetBpm()
  }
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    (cb as HTMLInputElement).checked = false;
  });
  updateSelectedItems(selectedItemsContainer, selectedItems);
}
export function filterMenu(searchInput: string, menuContainerID: string) {
  const searchTerm = (document.getElementById(searchInput) as HTMLInputElement)?.value?.toLowerCase() || '';
  const menuContainer = document.getElementById(menuContainerID);
  const items = menuContainer?.querySelectorAll('div > span');

  items?.forEach(span => {
    const parent = span.parentElement;
    if (span.textContent?.toLowerCase().includes(searchTerm.toLowerCase())) {
      (parent as HTMLElement).style.display = 'block';
    } else {
      (parent as HTMLElement).style.display = 'none';
    }
  });
}

function openCloseButtons(menuWrapperID: string) {
  const menuWrapper = document.getElementById(menuWrapperID) as HTMLElement;
  const openMenuButton = document.createElement('button');
  openMenuButton.textContent = 'Open';
  openMenuButton.style.height = '20px';
  if (menuWrapper && menuWrapper.parentNode) {
    menuWrapper.parentNode.insertBefore(openMenuButton, menuWrapper);
  }
  const closeMenuButton = document.createElement('button');
  closeMenuButton.textContent = 'Close';
  closeMenuButton.style.height = '20px';
  menuWrapper?.insertBefore(closeMenuButton, menuWrapper.firstChild);
  closeMenuButton.style.display = 'none';
  openMenuButton.addEventListener('click', function () {
    menuWrapper.style.display = 'block';
    openMenuButton.style.display = 'none';
    closeMenuButton.style.display = 'block';
  });
  closeMenuButton.addEventListener('click', function () {
    menuWrapper.style.display = 'none';
    openMenuButton.style.display = 'block';
    closeMenuButton.style.display = 'none';
  });
}

function menuSubmit(menuSubmitBtnID: string) {
  const submitButton = document.getElementById(menuSubmitBtnID);
  submitButton?.addEventListener('click', async function () {
    //filterSounds(1)
    window.dispatchEvent(new Event('refreshSounds'))
  });
}