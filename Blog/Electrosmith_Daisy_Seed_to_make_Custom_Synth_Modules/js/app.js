let isToggled = false;
let device_01;
let canvas;
let outputNode;
let scope;

async function setup() {
  // Create AudioContext
  const WAContext = window.AudioContext || window.webkitAudioContext;
  const context = new WAContext();

  // Create gain node and connect it to audio output
  outputNode = context.createGain();
  outputNode.connect(context.destination);

  // Fetch the exported patchers
  let response = await fetch('export/00_clicks.json');
  const patch_00 = await response.json();
  response = await fetch('export/01_simpleenv.json');
  const patch_01 = await response.json();
  response = await fetch('export/02_additive_sequence.json');
  const patch_02 = await response.json();

  // Create the devices
  const device_00 = await RNBO.createDevice({ context, patcher: patch_00 });
  const device_01 = await RNBO.createDevice({ context, patcher: patch_01 });
  const device_02 = await RNBO.createDevice({ context, patcher: patch_02 });

  document.body.onclick = () => {
    context.resume();
  };

  // makeSliders(device_01, 1);
  // makeSliders(device_02, 2);

  const toggleButton_00 = document.getElementById('00_ezdac-button');
  const param_00 = device_00.parametersById.get('toggle');

  toggleButton_00.addEventListener('click', function () {
    isToggled = !isToggled;
    this.classList.toggle('active');
    // You may also want to trigger other actions based on the value of isToggled
    if (isToggled) {
      device_00.node.connect(outputNode);
      param_00.value = 1;
      document.getElementById('00_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_on.svg')";
      // osc.start();
    } else {
      param_00.value = 0;
      document.getElementById('00_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_off.svg')";
    }
  });

  const toggleButton_01 = document.getElementById('01_ezdac-button');
  const param_01 = device_01.parametersById.get('toggle');

  toggleButton_01.addEventListener('click', function () {
    isToggled = !isToggled;
    this.classList.toggle('active');
    // You may also want to trigger other actions based on the value of isToggled
    if (isToggled) {
      device_01.node.connect(outputNode);
      param_01.value = 1;
      document.getElementById('01_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_on.svg')";
      // osc.start();
    } else {
      param_01.value = 0;
      document.getElementById('01_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_off.svg')";
    }
  });

  const toggleButton_02 = document.getElementById('02_ezdac-button');
  const param_02 = device_02.parametersById.get('toggle');

  toggleButton_02.addEventListener('click', function () {
    isToggled = !isToggled;
    this.classList.toggle('active');
    // You may also want to trigger other actions based on the value of isToggled
    if (isToggled) {
      device_02.node.connect(outputNode);
      param_02.value = 1;
      document.getElementById('02_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_on.svg')";
    } else {
      param_02.value = 0;
      document.getElementById('02_ezdac-button').style.backgroundImage = "url('../../resources/ezdac_off.svg')";
    }
  });
}

function makeSliders(device, patch_number) {
  console.log(`rnbo-parameter-sliders_device_${patch_number}`);
  let pdiv = document.getElementById(`rnbo-parameter-sliders_device_${patch_number}`);

  // This will allow us to ignore parameter update events while dragging the slider.
  let isDraggingSlider = false;
  let uiElements = {};

  device.parameters.forEach((param) => {
    // Subpatchers also have params. If we want to expose top-level
    // params only, the best way to determine if a parameter is top level
    // or not is to exclude parameters with a '/' in them.
    // You can uncomment the following line if you don't want to include subpatcher params

    // Create a label, an input slider and a value display
    let label = document.createElement('label');
    let slider = document.createElement('input');
    let text = document.createElement('input');
    let sliderContainer = document.createElement('div');
    sliderContainer.appendChild(label);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(text);

    // Add a name for the label
    label.setAttribute('name', param.name);
    label.setAttribute('for', param.name);
    label.setAttribute('class', 'param-label');
    label.textContent = `${param.name}: `;

    // Make each slider reflect its parameter
    slider.setAttribute('type', 'range');
    slider.setAttribute('class', 'param-slider');
    slider.setAttribute('id', param.id);
    slider.setAttribute('name', param.name);
    slider.setAttribute('min', param.min);
    slider.setAttribute('max', param.max);
    if (param.steps > 1) {
      slider.setAttribute('step', (param.max - param.min) / (param.steps - 1));
    } else {
      slider.setAttribute('step', (param.max - param.min) / 1000.0);
    }
    slider.setAttribute('value', param.value);

    // Make a settable text input display for the value
    text.setAttribute('value', param.value.toFixed(1));
    text.setAttribute('type', 'text');

    // Make each slider control its parameter
    slider.addEventListener('pointerdown', () => {
      isDraggingSlider = true;
    });
    slider.addEventListener('pointerup', () => {
      isDraggingSlider = false;
      slider.value = param.value;
      text.value = param.value.toFixed(1);
    });
    slider.addEventListener('input', () => {
      let value = Number.parseFloat(slider.value);
      param.value = value;
    });

    // Make the text box input control the parameter value as well
    text.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        let newValue = Number.parseFloat(text.value);
        if (isNaN(newValue)) {
          text.value = param.value;
        } else {
          newValue = Math.min(newValue, param.max);
          newValue = Math.max(newValue, param.min);
          text.value = newValue;
          param.value = newValue;
        }
      }
    });

    // Store the slider and text by name so we can access them later
    uiElements[param.id] = { slider, text };

    // Add the slider element
    console.log(param.name);
    if (param.name != 'toggle') {
      pdiv.appendChild(sliderContainer);
    }
  });

  // Listen to parameter changes from the device
  device.parameterChangeEvent.subscribe((param) => {
    if (!isDraggingSlider) uiElements[param.id].slider.value = param.value;
    uiElements[param.id].text.value = param.value.toFixed(1);
  });
}

setup();
