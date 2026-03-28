const materials = {
    "cement": ["Bamburi Cement",
        "Simba Cement"],
    "sand": ["River Sand",
        "Pit Sand"],
    "Ballast": ["Mazeras",
        "Calcium"],
    "Blocks": ["300x150x150",
        "360x180x180",
        "400x200x200"],
    "Steel": ["D8",
        "D10",
        "D12",
        "D16",
        "D20",
        "D25",
        "D32"]
}
let activeMaterials = {
    cement: "",
    sand: "",
    ballast: "",
    blocks: "",
    steel: ""
};
function storeCostsOnChange(el) {
    value = el.value;
    name = el.id;
    localStorage.setItem(name, value)
}
let currentMainMaterial = ""; // Track which main material is being selected

function getRequiredMaterial(el) {
    const key = document.getElementById("material-select").value;
    const value = el.value;

    // Only update if both key and value are valid
    if (key && value) {
        activeMaterials[key] = value;
        console.log("Active Materials:", activeMaterials);
        // Save to localStorage
        localStorage.setItem("activeMaterials", JSON.stringify(activeMaterials));

        // Show success message
        console.log(`Saved: ${key} = ${value}`);
    }
}

let material = "";
let price = 0;

// Populate the main material dropdown on page load
function populate(tag, population) {
    const mainSelect = document.getElementById(tag);
    // Clear existing options except first if any
    mainSelect.innerHTML = '<option value="">Choose Material</option>';
    for (let key in population) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
        mainSelect.appendChild(option);
    }
}
populate("main-material-select", materials)
populate("material-select", materials)

// Populate sub-materials based on main material selected
function populateSubMaterials(el, tag) {
    currentMainMaterial = el.value; // store main material
    console.log(`Main material selected: ${currentMainMaterial}`);

    const subSelect = document.getElementById(tag);
    subSelect.innerHTML = '<option value="">Choose Submaterial</option>'; // reset sub-material options

    if (currentMainMaterial && materials[currentMainMaterial]) {
        materials[currentMainMaterial].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subSelect.appendChild(option);
        });
    }
}

// Store sub-material selection and update activeMaterials
function getMaterial(el) {
    material = el.value;
    console.log(`Sub-material selected: ${material}`);

    // Get the main material from the main-material-select dropdown
    const mainMaterialSelect = document.getElementById("main-material-select");
    const mainMaterial = mainMaterialSelect.value;

    // Update activeMaterials based on the main material
    if (mainMaterial && material) {
        // Convert main material to lowercase for activeMaterials keys
        const key = mainMaterial.toLowerCase();
        if (activeMaterials.hasOwnProperty(key)) {
            activeMaterials[key] = material;
            console.log(`Updated activeMaterials: ${key} = ${material}`);
            localStorage.setItem("activeMaterials", JSON.stringify(activeMaterials));
        }
    }
}

// Store price
function getPrice(el) {
    price = document.getElementById(el).value;

    console.log(`Price = ${price}`);
    if (material) {
        localStorage.setItem(material, price);
        console.log(`Saved price for ${material}: ${price}`);

        // Show confirmation
        const priceInput = document.getElementById(el);
        priceInput.style.borderColor = "green";
        setTimeout(() => {
            priceInput.style.borderColor = "";
        }, 1000);
    }
}

function calculatemix(currency, volume, ratio, factor, cementPrice, sandPrice, ballastPrice = 0) {
    const mix = getRatio(ratio);
    const cementratio = mix[0];
    const sandratio = mix[1];
    const ballastRatio = mix[2] || 0;
    const ratioSum = cementratio+sandratio+ballastRatio;

    const dryVolume = volume*factor;
    const cement = Math.ceil(cementratio*dryVolume*28.96/ratioSum);
    console.log(`cement = ${cement} bags`)
    const sand = Math.ceil(sandratio* dryVolume*1.8/ratioSum);
    console.log(`sand = ${sand} tons`)
    const ballast = Math.ceil(ballastRatio*dryVolume*2.2/ratioSum);
    console.log(`ballast = ${ballast} tons`)
    const cementCost = Math.ceil(cement*cementPrice);
    const sandCost = Math.ceil(sandPrice*sand);
    const ballastCost = Math.ceil(ballastPrice*ballast);
    const materialCost = cementCost+sandCost+ballastCost;
    const cementDescription = `Cement...${cement}...bags...${currency}.${cementPrice}...${currency}.${cementCost}`;
    const sandDescription = `Sand...${sand}...tons...${currency}.${sandPrice}...${currency}.${sandCost}`;
    const ballasDescription = `Ballast...${ballast}...tons...${currency}.${ballastPrice}...${currency}.${ballastCost}`
    return [materialCost,
        cementDescription,
        sandDescription,
        ballasDescription]
}

function calculatewalling() {
    const area = parseFloat(document.getElementById("wall-area-input").value) || 0;
    const morta = localStorage.getItem("morta-ratio");
    const laborPercent = parseFloat(localStorage.getItem("labor")) || 0;
    const currency = document.getElementById("currency-select").value;

    // Check if area is valid
    if (area <= 0) {
        alert("Please enter a valid area greater than 0");
        return;
    }

    const block = activeMaterials.blocks;
    const cement = activeMaterials.cement;
    const sand = activeMaterials.sand;

    console.log("Current active materials:", activeMaterials);
    console.log("Block:", block, "Cement:", cement, "Sand:", sand);

    // 🚨 Safety check with detailed message
    if (!block) {
        alert("Please select blocks in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'Blocks' from Material dropdown\n3. Select block size (e.g., 400x200x200)\n4. Enter price and click submit");
        return;
    }
    if (!cement) {
        alert("Please select cement in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'cement' from Material dropdown\n3. Select cement brand (e.g., Bamburi Cement)\n4. Enter price and click submit");
        return;
    }
    if (!sand) {
        alert("Please select sand in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'sand' from Material dropdown\n3. Select sand type (e.g., River Sand)\n4. Enter price and click submit");
        return;
    }

    const blockPrice = parseFloat(localStorage.getItem(block)) || 0;
    const cementPrice = parseFloat(localStorage.getItem(cement)) || 0;
    const sandPrice = parseFloat(localStorage.getItem(sand)) || 0;

    console.log("Prices - Block:", blockPrice, "Cement:", cementPrice, "Sand:", sandPrice);

    // Check if prices are valid
    if (blockPrice <= 0) {
        alert(`Please enter a price for ${block} in the catalogue section.`);
        return;
    }
    if (cementPrice <= 0) {
        alert(`Please enter a price for ${cement} in the catalogue section.`);
        return;
    }
    if (sandPrice <= 0) {
        alert(`Please enter a price for ${sand} in the catalogue section.`);
        return;
    }

    const blocks = calculateBlock(area, block, blockPrice, currency);

    // Check if blocks calculation returned valid data
    if (!blocks || blocks[1] === undefined) {
        alert("Error calculating blocks. Please check block dimensions format (should be like 400x200x200)");
        return;
    }

    const mortaMix = calculatemix(
        currency,
        blocks[1],
        morta,
        1.3,
        cementPrice,
        sandPrice
    );

    const materialCost = mortaMix[0] + blocks[0];
    const laborCost = Math.ceil(materialCost * laborPercent / 100);
    const totalCost = laborCost + materialCost;
    const unitCost = Math.ceil(totalCost / area);

    const description = `
    ${blocks[2]}<br>
    ${mortaMix[1]}<br>
    ${mortaMix[2]}<br>
    Materials...${currency}.${materialCost}<br>
    Labor...${currency}.${laborCost}<br>
    Total...${currency}.${totalCost}<br>
    Unit Cost...${currency}.${unitCost}
    `;

    document.getElementById("wall-unit-cost-label").innerHTML = description;
}

function calculateBlock(area, block, price, currency) {
    console.log(`area = ${area}m²`)
    console.log(`block = ${block}`)
    console.log(`price = ${price}`)
    const blockMeasurements = getBlockMeasurements(block);
    const lengthOfBlock = blockMeasurements[0];
    const widthOfBlock = blockMeasurements[1];
    const heightOfBlock = blockMeasurements[2];
    const builtBlockLength = (lengthOfBlock+20)/1000;
    const builtBlockHeight = (heightOfBlock+20)/1000;
    const blockArea = builtBlockLength*builtBlockHeight;
    const blocks = Math.ceil(area/blockArea)
    console.log(`blocks = ${blocks} pcs`)
    const blockVolume = blocks*lengthOfBlock*widthOfBlock*heightOfBlock/1000000000;
    const wallVolume = area*widthOfBlock/1000;
    const mortaVolume = wallVolume-blockVolume;
    const cost = blocks*price;
    const blockDescription = `${block} blocks...${blocks}...pcs...${currency}.${price}...${currency}.${cost}`
    return [cost,
        mortaVolume,
        blockDescription]
}

function calculateColumnFoundationBarLength(width, depth, cover) {
    const bend = depth-2*cover;
    const span = width-2*cover;
    const bar = span+2*bend;
    return bar
}
function calculateColumnFoundationBarNumber(cover, length, number, spacing) {
    const span = length-cover-cover;
    const spaces = Math.ceil(span/spacing)
    const bars = spaces+1;
    return bars*number
}
function calculateLinksLength(width, depth, cover, bar) {
    const length = width-(2*cover);
    const height = depth-(2*cover);
    const bends = bar*12.5*2;
    const perimeter = 2*(length+height);
    return perimeter+bends
}
function calculateNumberOfLinkBar(length, number, spacing) {
    const numberPerStructure = Math.ceil(length/spacing);
    return numberPerStructure*number
}
function calculateBars(length, number) {
    const numberOfBarsInFullBar = Math.floor(12000/length);
    const fullBars = Math.ceil(number/numberOfBarsInFullBar)
    const remainingBars = 12000%length;
    return [number,
        fullBars,
        remainingBars]}
function convertStringListItemsToFloats(itemList) {
    let floats = itemList.map(n => parseFloat(n));

    console.log(floats);
    return floats
}
function getInfoFromData(data, seperator) {
    // Handle empty or invalid data
    if (!data || typeof data !== 'string') {
        console.error("Invalid data provided to getInfoFromData:", data);
        return [0,
            0,
            0];
    }

    const dataList = data.split(seperator);
    // Trim whitespace from each item before parsing
    const trimmedList = dataList.map(item => item.trim());
    const info = convertStringListItemsToFloats(trimmedList);
    return info
}
function getBlockMeasurements(block) {
    return getInfoFromData(block, "x")
}
function getRatio(ratio) {
    return getInfoFromData(ratio, ":")
}

function calculateConcrete() {
    const ballast = activeMaterials.ballast;
    const cement = activeMaterials.cement;
    const sand = activeMaterials.sand;

    console.log("Current active materials:", activeMaterials);
    console.log("ballast:", ballast, "Cement:", cement, "Sand:", sand);

    // 🚨 Safety check with detailed message
    if (!ballast) {
        alert("Please select blocks in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'Blocks' from Material dropdown\n3. Select block size (e.g., 400x200x200)\n4. Enter price and click submit");
        return;
    }
    if (!cement) {
        alert("Please select cement in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'cement' from Material dropdown\n3. Select cement brand (e.g., Bamburi Cement)\n4. Enter price and click submit");
        return;
    }
    if (!sand) {
        alert("Please select sand in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'sand' from Material dropdown\n3. Select sand type (e.g., River Sand)\n4. Enter price and click submit");
        return;
    }

    const volume = parseFloat(document.getElementById("concrete-volume").value) || 0;
    equipmentCost = parseFloat(localStorage.getItem("equipment")) || 0;
    const ballastPrice = parseFloat(localStorage.getItem(ballast)) || 0;
    const cementPrice = parseFloat(localStorage.getItem(cement)) || 0;
    const sandPrice = parseFloat(localStorage.getItem(sand)) || 0;;
    laborPercent = parseFloat(localStorage.getItem("labor")) || 0;
    const ratio = localStorage.getItem("concrete-ratio");
    const currency = document.getElementById("currency-select").value;

    // Check if volume is valid
    if (volume <= 0) {
        alert("Please enter a valid volume greater than 0");
        return;
    }

    const concreteMix = calculatemix(
        currency,
        volume,
        ratio,
        1.54,
        cementPrice,
        sandPrice,
        ballastPrice
    )
    const laborCost = laborPercent*concreteMix[0]/100;
    const totalCost = concreteMix[0]+equipmentCost+laborCost;
    const unitCost = Math.ceil(totalCost/volume)
    const description = `${concreteMix[1]}<br>${concreteMix[2]}<br>${concreteMix[3]}<br>Material cost...${currency}.${concreteMix[0]}<br>Labor cost...${currency}.${laborCost}<br>Equipment Cost...${currency}.${equipmentCost}<br>Total Cost...${currency}.${totalCost}<br>Unit Cost...${currency}.${unitCost}`
    document.getElementById("concrete-unit-cost-label").innerHTML = description;
}

function calculatePlaster() {
    const area = parseFloat(document.getElementById("plaster-area-input").value) || 0;
    const thickness = parseFloat(document.getElementById("plaster-thickness-input").value) || 0;
    const cement = activeMaterials.cement;
    const sand = activeMaterials.sand;

    console.log("Current active materials:", activeMaterials);
    console.log("Cement:", cement, "Sand:", sand);

    // 🚨 Safety check with detailed message
    if (!cement) {
        alert("Please select cement in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'cement' from Material dropdown\n3. Select cement brand (e.g., Bamburi Cement)\n4. Enter price and click submit");
        return;
    }
    if (!sand) {
        alert("Please select sand in the catalogue section first.\n\nSteps:\n1. Go to Catalogue section\n2. Select 'sand' from Material dropdown\n3. Select sand type (e.g., River Sand)\n4. Enter price and click submit");
        return;
    }
    const cementPrice = parseFloat(localStorage.getItem(cement)) || 0;
    const sandPrice = parseFloat(localStorage.getItem(sand)) || 0;
    laborPercent = parseFloat(localStorage.getItem("labor")) || 0;
    const ratio = localStorage.getItem("plaster-ratio") || "1:3";
    const currency = document.getElementById("currency-select").value;

    // Check if area and thickness are valid
    if (area <= 0) {
        alert("Please enter a valid area greater than 0");
        return;
    }
    if (thickness <= 0) {
        alert("Please enter a valid thickness greater than 0");
        return;
    }

    const volume = area*thickness/1000;
    const plasterMix = calculatemix(
        currency,
        volume,
        ratio,
        1.3,
        cementPrice,
        sandPrice
    )
    const laborCost = laborPercent*plasterMix[0]/100;
    const totalCost = plasterMix[0]+laborCost;
    const unitCost = Math.ceil(totalCost/area)
    const description = `${plasterMix[1]}<br>${plasterMix[2]}<br>Material cost...${currency}.${plasterMix[0]}<br>Labor cost...${currency}.${laborCost}<br>Total Cost...${currency}.${totalCost}<br>Unit Cost...${currency}.${unitCost}`
    document.getElementById("plaster-unit-cost-label").innerHTML = description;
}

function calculateSteelPricePerUnitWeight() {
    const steel = activeMaterials.steel;
    const barSize = parseInt(steel.slice(1));
    const quantity = parseFloat(document.getElementById("bar-number").value) || 0;
    const price = parseFloat(localStorage.getItem(steel)) || 0;
    console.log(price)
    labor = parseFloat(localStorage.getItem("labor")) || 0;
    const label = document.getElementById("steel-unit-label");
    const currency = document.getElementById("currency-select").value;

    // Check if inputs are valid
    if (quantity <= 0) {
        alert("Please enter a valid quantity");
        return;
    }
    if (price <= 0) {
        alert("Please enter a valid price");
        return;
    }

    const radius = barSize/2000;
    const weight = Math.PI*12*7850*quantity*radius**2;
    const bindingWire = Math.ceil(weight*13/1000);
    const cost = price*quantity;
    const materialUnitCost = Math.ceil(cost/weight);
    const laborUnitCost = materialUnitCost*labor/100
    const steelUnitCost = materialUnitCost+laborUnitCost;
    const totalCost = Math.ceil(weight*steelUnitCost);
    const description = `steel bar weight = ${Math.ceil(weight)}kg<br>binding wire = ${bindingWire}kg<br>steel bar unit cost = ${currency}.${materialUnitCost} per kg<br> steel bar labor = ${currency}.${laborUnitCost} per kg<br>D${barSize}...${Math.ceil(weight)}...kg...${currency}.${steelUnitCost}..${currency}${totalCost}`
    label.innerHTML = description;
}
function calculateFullBars() {
    const length = parseFloat(document.getElementById("bar-length-input").value) || 0;
    const number = parseInt(document.getElementById("bar-number-input").value) || 0;

    // Check if inputs are valid
    if (length <= 0) {
        alert("Please enter a valid bar length");
        return;
    }
    if (number <= 0) {
        alert("Please enter a valid number");
        return;
    }

    const bars = calculateBars(length, number)
    const description = `full bars = ${bars[1]} no\nOff cuts = ${bars[0]} pcs each ${bars[2]}mm`
    document.getElementById("bar-number-label").innerHTML = description
}

function getRings() {
    const cover = parseFloat(document.getElementById("cover-input").value) || 0;
    const length = parseFloat(document.getElementById("length-input").value) || 0;
    const width = parseFloat(document.getElementById("width-input").value) || 0;
    const depth = parseFloat(document.getElementById("depth-input").value) || 0;
    const spacing = parseFloat(document.getElementById("spacing-input").value) || 0;
    const number = parseFloat(document.getElementById("number-input").value) || 0;
    const bar = parseInt(document.getElementById("steel-bar-select").value);

    // Check if inputs are valid
    if (length <= 0 || width <= 0 || depth <= 0) {
        alert("Please enter valid dimensions");
        return;
    }
    if (spacing <= 0) {
        alert("Please enter valid spacing");
        return;
    }
    if (number <= 0) {
        alert("Please enter valid number of structures");
        return;
    }

    const ringLength = calculateLinksLength(width, depth, cover, bar);
    const linksNumber = calculateNumberOfLinkBar(length, number, spacing);
    const bars = calculateBars(ringLength, linksNumber)
    const description = `full bars = ${bars[1]} no\nOff cuts = ${bars[0]} pcs each ${bars[2]}mm`
    document.getElementById("ring-bar-number-label").innerHTML = description
}

function calculateColumnFoundationRebar() {
    const cover = parseFloat(document.getElementById("column-foundation-cover-input").value) || 0;
    const length = parseFloat(document.getElementById("column-foundation-length-input").value) || 0;
    const width = parseFloat(document.getElementById("column-foundation-width-input").value) || 0;
    const depth = parseFloat(document.getElementById("column-foundation-depth-input").value) || 0;
    const number = parseFloat(document.getElementById("column-foundation-number-input").value) || 0;
    const spacing = parseFloat(document.getElementById("column-foundation-spacing-input").value) || 0;

    // Check if inputs are valid
    if (length <= 0 || width <= 0 || depth <= 0) {
        alert("Please enter valid dimensions");
        return;
    }
    if (spacing <= 0) {
        alert("Please enter valid spacing");
        return;
    }
    if (number <= 0) {
        alert("Please enter valid number of columns");
        return;
    }

    const bottomBar = calculateColumnFoundationBarLength(width, depth, cover)
    console.log(bottomBar)
    const topBar = calculateColumnFoundationBarLength(length, depth, cover)
    const bottoms = calculateColumnFoundationBarNumber(cover, length, number, spacing)
    const tops = calculateColumnFoundationBarNumber(cover, width, number, spacing)
    const bottomBars = calculateBars(bottomBar, bottoms)
    const topBars = calculateBars(topBar, tops)
    const description = `tops:${topBars[1]} pcs <br> ${tops}pcs@${topBar}mm long<br>bottoms:${bottomBars[1]} pcs<br>${bottoms}@${bottomBar}mm long`
    document.getElementById("column-foundation-label").innerHTML = description
}

// Load saved active materials from localStorage on page load
function loadSavedMaterials() {
    const savedMaterials = localStorage.getItem("activeMaterials");
    if (savedMaterials) {
        activeMaterials = JSON.parse(savedMaterials);
        console.log("Loaded saved materials:", activeMaterials);
    }
}

// Call loadSavedMaterials when the page loads
loadSavedMaterials();

// Debug function to check current selections
function debugSelections() {
    console.log("Active Materials:", activeMaterials);
    console.log("LocalStorage items:", localStorage);
}