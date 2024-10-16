
//Commercial filters - peter t

function loadData() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, 2000);
    });
}


// Get the filter elements
var filters = document.getElementById('filters')
var section = document.getElementById('search-sec')
var filterIcon = document.getElementById('icon')
var filterButton = document.getElementById('filter-btn')
var topsection = document.getElementById('topsection')
var searchInput = document.getElementById("productSearchInput");
var searchForm = document.getElementById("productSearchForm");
var productCount = document.getElementById("product-count");
var productData = document.getElementById("productData");
var searchButton = searchForm.querySelector(".searchinproduct");
//var resetAll = document.getElementById('resetAll')

var application = $('#application');
var typeContainer = $("#range_type");
var subFilters = $('#sub-filters');
var moreFiltersBtnContainer = $('#more');
var moreBtn = $('#moreBtnToggle');
var moreFilters = $('#more-filters');

var clearFiltersButton = $('#clear-filters-btn');
var filtersContainer = $('#filters-container');
var typeContainer = $("#range_type");
var productData = $('#productData');


$(document).ready(function () {
    // Function to toggle the visibility of the Clear All button based on active filters
    function toggleClearFiltersButton() {
        if ($('.filter-item-active').length > 0) {
            clearFiltersButton.show();
        } else {
            clearFiltersButton.hide();
        }
    }

    // Initial check for active filters when the page loads
    toggleClearFiltersButton();

    // Event listener for the Clear All button
    clearFiltersButton.on('click', function () {
        // Remove the 'filter-item-active' class from all elements
        $('.filter-item-active').removeClass('filter-item-active');

        // Clear contents of relevant elements
        typeContainer.empty();
        subFilters.empty();
        moreFiltersBtnContainer.hide();
        productData.empty();

       clearFiltersButton.hide();
    });

    // Ensure the button visibility is updated when a filter is toggled
    $(document).on('click', '.filter-item', function () {
        setTimeout(toggleClearFiltersButton, 100); // Adding a small delay to ensure class is applied
    });

    // Check visibility of the Clear All button again after any relevant actions
    toggleClearFiltersButton();
});

function toggleFilters() {
    if (window.innerWidth >= 769) {

        // Only toggle classes on desktop view
        if (filters.style.display === 'none' || filters.style.display === '') {
            filters.style.display = 'block';
            filterButton.classList.add('wrn-btn-active');
            filterIcon.classList.remove('fa-plus');
            filterIcon.classList.add('fa-minus');
            topsection.style.display = 'none';
        } else {
            filters.style.display = 'none';
            filterButton.classList.remove('wrn-btn-active');
            filterIcon.classList.remove('fa-minus');
            filterIcon.classList.add('fa-plus');
            topsection.style.display = '';
        }

    } else {
        filterIcon.classList.remove('fa-minus');
        filterIcon.classList.remove('fa-plus');
        filterButton.classList.add('btn-dark')
        topsection.style.display = 'none';

        // For mobile view, just toggle the filters display
        if (filters.style.display === 'none') {
            filters.style.display = 'block';
        } else {
            filters.style.display = 'block';
        }
    }
}

loadData().then(function () {
    if (section) {
        section.style.display = ''
    }
    if (filterButton) {
        filterButton.style.display = ''
        filterButton.addEventListener('click', function () {
            toggleFilters();
        });
    }
});

function getFilters(type) {
    return new Promise(function (resolve, reject) {
        if (!type) type = "commercial";
        var postdata = new Object();
        postdata.type = type;

        $.ajax({
            type: "POST",
            url: '/api/product/group-filters.aspx',
            dataType: "json",
            data: JSON.stringify(postdata),
            timeout: 10000,
            retryMax: 2,
            success: function (data) {
                resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            },
            complete: function () { }
        });
    });
}

getFilters().then(function (data) {
    var filterdata = data;

    displayFilters(filterdata);
    getData(filterdata);
}).catch(function (error) {
    console.error(error);
});


function getProduct(type, catID) {
    return new Promise(function (resolve, reject) {
        if (!type) type = "commercial";
        if (!catID) catID = 11078;
        var postdata = new Object();
        postdata.type = type;
        postdata.catID = catID;

        $.ajax({
            type: "POST",
            url: '/api/product/group-results.aspx',
            dataType: "json",
            data: JSON.stringify(postdata),
            timeout: 10000,
            retryMax: 2,
            success: function (data) {
                resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            },
            complete: function () { }
        });
    });
}


var activeIds = [];

function getData() {
    var products = $('#productData');

    application.on('click', '.default', function () {
        var thisElement = $(this);
        var rangeID = thisElement.attr('id');

        products.empty();
        $('#sub-filters').empty();
        moreFilters.empty();
        $('#selectedids').empty();
        typeContainer.empty();

        thisElement.toggleClass('filter-item-active').siblings().removeClass('filter-item-active');

        var anyActive = application.find('.default.filter-item-active').length > 0;

        if (!anyActive) {
            $('#application').removeClass('filter-item-active');
            products.empty();
            $('#sub-filters').empty();
            $('#more').hide();
            $('#selectedids').empty();
            typeContainer.empty();

        } else {
            // Clear previous filters
            subFilters.empty();
            moreFilters.empty();
            moreFiltersBtnContainer.hide();
            getProduct("commercial", rangeID)
                .then(function (data) {
                    if (data) {

                        displayProducts([], data, rangeID);
                        if (Object.keys(data.filterType).length === 0) {

                            displayNextFilters(rangeID, data);
                        } else {
                            Object.keys(data.filterType).forEach(function (key) {
                                var filterValue = data.filterType[key];
                                if (filterValue) {
                                    createIfTypeExists(rangeID, filterValue, data || {});
                                } else {

                                    displayNextFilters(rangeID, data);
                                }
                            });
                        }
                    } else {
                        displayNextFilters(rangeID, data);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    });

}

// Function to display filters
function displayFilters(filtersData) {
    var application = $("#application");
    var html = "<div class='col-md-2' style='text-align: left' class='filter-titles'>";
    html += "<h5 class='f-item-title'>Range</h5>";
    html += "</div><div class='col-md-10' style='text-align: left'>";

    Object.keys(filtersData.range).forEach(function (key) {
        var range = filtersData.range[key];
        range.forEach(function (data) {
            html += "<button class='filter-item default' data-filter='" + key + "' id='" + data.id + "'>" + data.name + "</button>";
        });
    });

    html += "</div>";
    application.html(html);
}

//if Range has Type property 
function createIfTypeExists(rangeID, filterType, filterdata) {
    var typeContainer = $('#range_type');
    var typeBtnContainer = $('#type-items-container');
    var html = "";
    var typeItems = filterType.items || [];

        if (typeItems.length > 0) {
        html += "<div class='col-md-2' style='text-align: left;margin-top:1rem' class='filter-titles'>";
        html += "<h5 class='f-item-title'>Type</h5>";
        html += "</div><div id='type-items-container' class='col-md-10' style='text-align: left;margin-top:1rem'>";

        typeItems.forEach(function (item) {
            html += "<button class='filter-item default' data-filter='" + item.id + "' id='" + item.id + "'>" + item.name + "</button>";
        });

        html += "</div>";
    } else {
        console.warn('No items found in filterType.');
    }

    typeContainer.html(html);

    // Event handler for Type filter buttons
    typeContainer.off('click', '.filter-item').on('click', '.filter-item', function () {

        var selectedTypeId = $(this).attr('id');
        var selectedType = typeItems.find(item => item.id == selectedTypeId);

        if (selectedType) {
            var excludeRefs = selectedType.excludeRefs ? selectedType.excludeRefs.split(',') : [];

            // Toggle active state
            var isActive = $(this).hasClass('filter-item-active');
            typeContainer.find('.filter-item').removeClass('filter-item-active');
            if (!isActive) {
                $(this).addClass('filter-item-active');
                activeIds = [selectedTypeId];
            } else {
                activeIds = [];
            }

            if (filterdata && filterdata.filters) {
                function filterCategory(category) {
                    if (category.ref && excludeRefs.includes(category.ref)) {
                        return null;
                    }

                    let filteredItems = category.items ? category.items.filter(item => !excludeRefs.includes(category.ref)) : [];
                    let filteredSubCategories = Object.keys(category).reduce((acc, key) => {
                        if (key !== 'items' && key !== 'ref' && key !== 'type') {
                            let filteredSubCategory = filterCategory(category[key]);
                            if (filteredSubCategory) {
                                acc[key] = filteredSubCategory;
                            }
                        }
                        return acc;
                    }, {});

                    if (filteredItems.length > 0 || Object.keys(filteredSubCategories).length > 0) {
                        return {
                            ...category,
                            items: filteredItems,
                            ...filteredSubCategories
                        };
                    } else {
                        return null;
                    }
                }

                var filteredItems = Object.keys(filterdata.filters).reduce((acc, key) => {
                    var category = filterdata.filters[key];
                    var filteredCategory = filterCategory(category);
                    if (filteredCategory) {
                        acc[key] = filteredCategory;
                    }
                    return acc;
                }, {});

                var filteredItemsMore = Object.keys(filterdata.filtersMore || {}).reduce((acc, key) => {
                    var category = filterdata.filtersMore[key];
                    var filteredCategory = filterCategory(category);
                    if (filteredCategory) {
                        acc[key] = filteredCategory;
                    }
                    return acc;
                }, {});


                displayProducts(activeIds, filterdata, rangeID); 

                displayNextFilters(rangeID, filterdata, filteredItems, filteredItemsMore, excludeRefs);


                //initial call for filters when Type exists 
                attachFilterButtonHandlers($(typeContainer), filterdata, rangeID);
                attachFilterButtonHandlers($('#application'), filterdata, rangeID);
                attachFilterButtonHandlers($('#sub-filters'), filterdata, rangeID);
                attachFilterButtonHandlers($('#more-filters'), filterdata, rangeID);


            } else {
                console.warn('Filterdata or filterdata.filters is missing.');
            }
        }
    });

    //attachFilterButtonHandlers($(typeContainer), filterdata, rangeID);
}

//build rest of the filters 
function displayNextFilters(rangeID, filterdata, filteredItems, filteredItemsMore, excludeRefs) {
    var productData = filterdata.cat;
    excludeRefs = Array.isArray(excludeRefs) ? excludeRefs : [];

    var subFilters = $('#sub-filters');
    var moreFilters = $('#more-filters');
    var moreFiltersBtnContainer = $('#more');
    var moreBtn = $('#moreBtnToggle');

    subFilters.empty();
    moreFilters.empty();

    function createFilterButton(itemsContainer, item, isMulti, hasNote, noteContent) {
        var button = $('<button class="filter-item filter-btn"></button>').attr('id', item.id);
        var buttonText = $('<span>').text(item.name);
        button.append(buttonText);

        if (hasNote && noteContent) {
            itemsContainer.addClass('has-note');
            button.css({ 'display': 'flex', 'flex-direction': 'column', 'line-height': 'unset', 'height': 'auto' });
            var note = $('<span class="note"></span>').text(noteContent);
            button.append(note);
        }
        if (isMulti) {
            button.attr('data-multi', true);
        }

        return button;
    }

    function createFilterItems(container, items, isMulti, hasNote, noteContent) {
        var lineContainer = $('<div class="filter-btn-container" style="text-align: left"></div>');

        items.forEach(function (item) {
            var note = item.note ? item.note : ""; // Get note from the item
            var button = createFilterButton(lineContainer, item, isMulti, hasNote, note);
            lineContainer.append(button);
        });

        container.append(lineContainer);
    }


    function ensureSliderContainerExists(containerId, title) {
        var sliderContainer = $('#' + containerId);
        if (!sliderContainer.length) {
            sliderContainer = $('<div class="slider-container col-md-10" style="text-align: left; display: flex; flex-wrap: wrap;"></div>').attr('id', containerId);
            var titleDiv = $('<div class="col-md-2 text-left">').append('<h5 class="f-item-title slider-container">' + title + '</h5>');
            $(subFilters).append(titleDiv, sliderContainer);
        }
        return sliderContainer;
    }

    function hasMatchingProducts(filterItem, products) {
        return products.some(product => {
            return product.filter && Object.values(product.filter).some(filterGroup => {
                return filterGroup.items && Array.isArray(filterGroup.items) && filterGroup.items.some(item => item.id === filterItem.id);
            });
        });
    }

    function createFilterContainers(data, container, createSliders = true) {

        Object.keys(data).forEach(function (attribute) {

            var attributeData = data[attribute];
            var items = attributeData?.items || [];
            var type = attributeData?.type;
            var ref = attributeData?.ref;

            if (excludeRefs.includes(ref)) {
                return;
            }

            if (attribute === "Capacities") {
                // Create a single container for both Cooling and Heating sliders
                var combinedSliderContainerId = 'slider-capacities';
                var sliderContainer = ensureSliderContainerExists(combinedSliderContainerId, attribute);

                ['Cooling', 'Heating'].forEach(function (nestedAttributeName) {
                    var filterData = data.Capacities[nestedAttributeName];
                    var nestedRef = filterData?.ref;

                    if (excludeRefs.includes(nestedRef)) {
                        return;
                    }

                    if (createSliders && filterData && Array.isArray(filterData.items) && filterData.items.length === 2 && filterData.type) {
                        var minValue = parseFloat(filterData.items.find(item => item.name === "min")?.value || 0);
                        var maxValue = parseFloat(filterData.items.find(item => item.name === "max")?.value || 0);

                        // Append sliders to the shared container
                        createSlider(combinedSliderContainerId, nestedAttributeName, `${nestedAttributeName.toLowerCase()}-min`, `${nestedAttributeName.toLowerCase()}-max`, minValue, maxValue, "kW", nestedAttributeName === "Cooling" ? '#1ecbe1' : '#F57979', filterData.type);
                    } else {
                    }
                });
            } else {
                if (attribute === "Air Flow") {
                    if (createSliders && items.length > 0) {
                        var containerId = 'slider-airflow';
                        ensureSliderContainerExists(containerId, "Air Flow");
                        createSlider(containerId, "AirFlow", 'airflow-min', 'airflow-max', parseFloat(items[0]?.value || 0), parseFloat(items[1]?.value || 1000), "L/S", '#F57979');
                    }
                } else {
                    if (items.length > 0) {
                        var filteredItems = items.filter(item => hasMatchingProducts(item, productData));

                        if (filteredItems.length > 0) {
                            var titleDiv = $('<div class="col-md-2 text-left">').append('<h5 class="f-item-title">' + attribute + '</h5>');
                            var itemsContainer = $('<div class="col-md-10 filter-btn-container" style="text-align: left">');
                            createFilterItems(itemsContainer, filteredItems, type === "multi", true, "");
                            container.append(titleDiv, itemsContainer);
                        } else {
                        }
                    } else {
                    }
                }
            }
        });
    }

    // Ensure filters are created for sub-filters and more-filters
    if (filterdata.filters) {
        if (filteredItems && Object.keys(filteredItems).length > 0) {
            createFilterContainers(filteredItems, subFilters);
        } else {
            createFilterContainers(filterdata.filters, subFilters);
        }

        if (filteredItemsMore && Object.keys(filteredItemsMore).length > 0) {
            createFilterContainers(filteredItemsMore, moreFilters, false);
        } else {
            createFilterContainers(filterdata.filtersMore, moreFilters, false);
        }

        attachFilterButtonHandlers($(typeContainer), filterdata, rangeID);
        attachFilterButtonHandlers($('#application'), filterdata, rangeID);
        attachFilterButtonHandlers($('#sub-filters'), filterdata, rangeID);
        attachFilterButtonHandlers($('#more-filters'), filterdata, rangeID);
    }

    // Show or hide the more filters button based on the content of moreFilters
    if (moreFilters.children().length > 0) {
        moreFiltersBtnContainer.show();
        moreBtn.show();
        moreBtn.on('click', function () {
            moreFilters.toggle()
        })
        
    } else {
        moreFiltersBtnContainer.hide();
        moreBtn.hide();
        moreFilters.hide()
    }
}


//check for active filters, collect active ids
function attachFilterButtonHandlers(container, filterdata, rangeID) {
    container.off('click', '.filter-btn').on('click', '.filter-btn', function () {
        var $this = $(this);
        var $line = $this.closest('.filter-btn-container'); // Assume each line is a container

        if ($this.hasClass('filter-item-active')) {
            $this.removeClass('filter-item-active'); // Toggle off if already active
        } else {
            if ($this.data('multi') === true) {
                $this.addClass('filter-item-active'); // Allow multiple active buttons if data-multi is true
            } else {
                $line.find('.filter-btn').removeClass('filter-item-active'); // Remove active from all in the line
                $this.addClass('filter-item-active'); // Add active to the clicked button
            }
        }

        // Collect active IDs from all containers except #application
        activeIds = $('#range_type .filter-item-active, #sub-filters .filter-item-active, #more-filters .filter-item-active').map(function () {
            return $(this).attr('id');
        }).get();

        // Ensure displayProducts is correctly implemented and available
        if (typeof displayProducts === 'function') {
            displayProducts(activeIds, filterdata, rangeID);
        } else {
            console.error('displayProducts function is not defined');
        }
    });
}


//filter products
function displayProducts(activeFiltersList, data, rangeID, searchQuery) {
    if (!data || typeof data !== 'object') {
        console.error('Invalid products data:', data);
        return;
    }

    var capacitiesHeat = data.filters && data.filters["Heating"];
    var capacitiesCool = data.filters && data.filters["Cooling"];
    var itCapacities = data.filters && data.filters.Capacities;
    var airFlow = data.filters && data.filters["Air Flow"];

    // Default values for sliders
    var defaultMinCooling = capacitiesCool ? parseFloat(capacitiesCool.items[0].value) : undefined;
    var defaultMaxCooling = capacitiesCool ? parseFloat(capacitiesCool.items[1].value) : undefined;
    var defaultMinHeating = capacitiesHeat ? parseFloat(capacitiesHeat.items[0].value) : undefined;
    var defaultMaxHeating = capacitiesHeat ? parseFloat(capacitiesHeat.items[1].value) : undefined;
    var airDefaultMin = airFlow ? parseFloat(airFlow.items[0].value) : undefined;
    var airDefaultMax = airFlow ? parseFloat(airFlow.items[1].value) : undefined;

    // Get current slider values for Heating, Cooling, and Air Flow
    var minHeatingSliderValue = $(rangeID + '-heating').data("from");
    var maxHeatingSliderValue = $(rangeID + '-heating').data("to");
    var minCoolingSliderValue = $(rangeID + '-cooling').data("from");
    var maxCoolingSliderValue = $(rangeID + '-cooling').data("to");
    var minAirFlowSliderValue = $(rangeID + '-airflow').data("from");
    var maxAirFlowSliderValue = $(rangeID + '-airflow').data("to");


    if (minHeatingSliderValue === undefined) {
        minHeatingSliderValue = defaultMinHeating;
    }
    if (maxHeatingSliderValue === undefined) {
        maxHeatingSliderValue = defaultMaxHeating;
    }
    if (minCoolingSliderValue === undefined) {
        minCoolingSliderValue = defaultMinCooling;
    }
    if (maxCoolingSliderValue === undefined) {
        maxCoolingSliderValue = defaultMaxCooling;
    }
    if (minAirFlowSliderValue === undefined) {
        minAirFlowSliderValue = airDefaultMin;
    }
    if (maxAirFlowSliderValue === undefined) {
        maxAirFlowSliderValue = airDefaultMax;
    }

    // If undefined, set default slider values
    if (minHeatingSliderValue === undefined || maxHeatingSliderValue === undefined) {
        minHeatingSliderValue = defaultMinHeating;
        maxHeatingSliderValue = defaultMaxHeating;
    }

    if (minCoolingSliderValue === undefined || maxCoolingSliderValue === undefined) {
        minCoolingSliderValue = defaultMinCooling;
        maxCoolingSliderValue = defaultMaxCooling;
    }

    if (minAirFlowSliderValue === undefined || maxAirFlowSliderValue === undefined) {
        minAirFlowSliderValue = airDefaultMin;
        maxAirFlowSliderValue = airDefaultMax;
    }

    // Listen for the slider values change event
    $(document).on('sliderValuesChanged', function (event, minValue, maxValue, type) {

        // Update the corresponding slider values
        if (type === 'heating') {
            minHeatingSliderValue = minValue;
            maxHeatingSliderValue = (minValue === maxValue) ? defaultMaxHeating : maxValue;
        } else if (type === 'cooling') {
            minCoolingSliderValue = minValue;
            maxCoolingSliderValue = (minValue === maxValue) ? defaultMaxCooling : maxValue;
        } else if (type === 'airflow') {
            minAirFlowSliderValue = minValue;
            maxAirFlowSliderValue = (minValue === maxValue) ? airDefaultMax : maxValue;
        }

        filterProducts();  // Re-filter products after slider value change
    });

    function filterProducts() {
        // If there are no active filters, render all products
        if (!Array.isArray(activeFiltersList) || activeFiltersList.length === 0) {
            renderProducts(Object.values(data.cat));
            return;
        }
        
        var filteredProducts = Object.values(data.cat);
       
        // Apply active filters
        if (Array.isArray(activeFiltersList) && activeFiltersList.length > 0) {
            filteredProducts = filteredProducts.filter(function (product) {
                return activeFiltersList.every(function (activeFilter) {
                    return Object.values(product.filter).some(function (filterGroup) {
                        if (filterGroup && filterGroup.items) {
                            return filterGroup.items.some(function (item) {
                                return activeFilter === item.id.toString();
                            });
                        }
                        return false;
                    });
                });
            });
        }

        // Apply Heating, Cooling, and Air Flow filters based on slider values
        if ((minHeatingSliderValue !== undefined && maxHeatingSliderValue !== undefined) ||
            (minCoolingSliderValue !== undefined && maxCoolingSliderValue !== undefined) ||
            (minAirFlowSliderValue !== undefined && maxAirFlowSliderValue !== undefined)) {

            filteredProducts = filteredProducts.filter(function (product) {
                var airFlow = product.filter["Air Flow"];
                var capacities = product.filter && product.filter.Capacities;
                var capacitiesHeat = capacities && capacities.Heating;
                var capacitiesCool = capacities && capacities.Cooling;

                var heatMin = capacitiesHeat ? parseFloat(capacitiesHeat.items[0].value) : NaN;
                var heatMax = capacitiesHeat ? parseFloat(capacitiesHeat.items[1].value) : NaN;
                var coolMin = capacitiesCool ? parseFloat(capacitiesCool.items[0].value) : NaN;
                var coolMax = capacitiesCool ? parseFloat(capacitiesCool.items[1].value) : NaN;
                var airMin = airFlow ? parseFloat(airFlow.items[0].value) : NaN;
                var airMax = airFlow ? parseFloat(airFlow.items[1].value) : NaN;

                // Round slider values to 2 decimal points for comparison, if they are not NaN
                var roundedMinHeatingSliderValue = isNaN(minHeatingSliderValue) ? NaN : parseFloat(minHeatingSliderValue.toFixed(2));
                var roundedMaxHeatingSliderValue = isNaN(maxHeatingSliderValue) ? NaN : parseFloat(maxHeatingSliderValue.toFixed(2));
                var roundedMinCoolingSliderValue = isNaN(minCoolingSliderValue) ? NaN : parseFloat(minCoolingSliderValue.toFixed(2));
                var roundedMaxCoolingSliderValue = isNaN(maxCoolingSliderValue) ? NaN : parseFloat(maxCoolingSliderValue.toFixed(2));
                var roundedMinAirFlowSliderValue = isNaN(minAirFlowSliderValue) ? NaN : parseFloat(minAirFlowSliderValue.toFixed(2));
                var roundedMaxAirFlowSliderValue = isNaN(maxAirFlowSliderValue) ? NaN : parseFloat(maxAirFlowSliderValue.toFixed(2));

                // Check if product matches Heating filter
                var matchesHeating = (capacitiesHeat && !isNaN(heatMin) && !isNaN(heatMax) &&
                    (heatMin >= roundedMinHeatingSliderValue && heatMax <= roundedMaxHeatingSliderValue));

                // Check if product matches Cooling filter
                var matchesCooling = (capacitiesCool && !isNaN(coolMin) && !isNaN(coolMax) &&
                    (coolMin >= roundedMinCoolingSliderValue && coolMax <= roundedMaxCoolingSliderValue));

                // Check if product matches Air Flow filter
                var matchesAirFlow = (airFlow && !isNaN(airMin) && !isNaN(airMax) &&
                    (airMin >= roundedMinAirFlowSliderValue && airMax <= roundedMaxAirFlowSliderValue));

                // The product should meet Heating, Cooling, or Air Flow criteria
                return matchesHeating || matchesCooling || matchesAirFlow;
            });
        }
        // Finally render filtered products
        renderProducts(filteredProducts, rangeID);
    }

    filterProducts();  // Initial product filtering based on active filters and slider values
}


//displaying products based on active-filters 
function renderProducts(products, rangeID) {
    var html = "";
    var pcount = products.length;

    $('#product-count').text(pcount);

    // Check if there are no products
    if (pcount === 0) {
        $("#productData").html(
            '<div class="text-center p-4" style="max-width: 600px; margin: auto;">' +
            '<p>We couldn&rsquo;t find any products matching your selected filters. For more options, please explore this ' + 
            '<a href="/commercial/group.aspx?cat=' + rangeID + '" target="_blank"> full category here</a>.' +
            '</p>' +
            '</div>'
        );
        return; // Exit the function since there are no products to render
    }

    // Generate HTML for filtered products
    products.forEach(function (product) {
        var id = product.id;
        var desc = product.desc;
        var imgURL = product.imgURL || '/images/commercial/placeholder-image.png';
        var title = product.title;

        if (id) {
            html += "<div class='col-md-6 col-lg-3 mb-4'>"; // Adjust column size for responsiveness
            html += "    <a href='/commercial/group.aspx?cat=" + id + "' class='card-link'>"; // Wrap the whole card in an anchor tag
            html += "        <div class='card border-light shadow-sm rounded'>"; // card with shadow
            html += "            <img class='card-image' src='" + imgURL + "' alt='not found' />"; // card image
            html += "            <div class='card-body'>";
            html += "                <h5 class='card-title'>" + title + "</h5>"; // card title
            html += "                <p class='card-text pl-3'>" + desc + "</p>"; // card text
            html += "            </div>";
            html += "            <div class='card-footer text-center'>"; // Centered card footer
            html += "                <button class='btn btn-primary'>View Product</button>"; // button
            html += "            </div>";
            html += "        </div>";
            html += "    </a>"; // Close the anchor tag
            html += "</div>";
        }
    });

    // Display the products
    $("#productData").html(html);

}



var sliders = {}; // To keep track of sliders and their state

// Initialize sliders and handle filter logic
function createSlider(containerId, title, minId, maxId, minValue, maxValue, unit, color, type) {
    var containerElement = document.getElementById(containerId);
    var subFiltersElement = document.getElementById('sub-filters');
    var moreFiltersElement = document.getElementById('more-filters');
    var typeFiltersElement = document.getElementById('type-items-container');
    
    if (!containerElement) {
        console.error("Container element with ID '" + containerId + "' not found.");
        return;
    }

    // Check if the slider doesn't already exist
    if (!document.getElementById(containerId + '-' + title.toLowerCase() + '-slider')) {
        createSingleSlider(containerElement, containerId, title, minId, maxId, minValue, maxValue, unit, color, type);
    }

    // Function to toggle slider state
    function toggleSliderState() {

        var titleDiv = document.querySelector('.f-item-title.slider-container');

        // Check filter activation state
        var hasActiveClassInSubFilters = subFiltersElement && subFiltersElement.querySelector('.filter-item-active') !== null;
        var hasActiveClassInMoreFilters = moreFiltersElement && moreFiltersElement.querySelector('.filter-item-active') !== null;
        var hasActiveClassIntypeContainer = typeFiltersElement && typeFiltersElement.querySelector('.filter-item-active') !== null;
        var hasActiveClass = hasActiveClassInSubFilters || hasActiveClassInMoreFilters || hasActiveClassIntypeContainer;

        // Toggle title visibility
        if (titleDiv) {
            titleDiv.style.display = hasActiveClass ? '' : 'none';
            titleDiv.classList.toggle('mb-3', hasActiveClass);
        }

        // Toggle slider container visibility and state
        var sliderContainers = containerElement.querySelectorAll('.bs-slider');
        sliderContainers.forEach(function (sliderContainer) {
            var sliderId = sliderContainer.querySelector('.js-range-slider').id;
            if (sliders[sliderId]) {
                var sliderData = sliders[sliderId];
                if (hasActiveClass) {
                    sliderContainer.style.display = '';
                    sliderData.instance.update({ disable: false });
                } else {
                    sliderContainer.style.display = 'none';
                    var sliderInputs = sliderContainer.querySelectorAll('.input-min, .input-max');
                    sliderInputs.forEach(function (input) {
                        if (input.classList.contains('input-min')) {
                            input.value = sliderData.instance.options.min;
                        } else {
                            input.value = sliderData.instance.options.max;
                        }
                    });
                }
            }
        });
    }

    // Initial call to set slider state
    toggleSliderState();

    // Event listener to toggle sliders when filters are clicked
    document.addEventListener('click', function (event) {
        if (event.target.closest('#sub-filters .filter-item') || (moreFiltersElement && event.target.closest('#more-filters .filter-item'))) {
            toggleSliderState();
        }
    });
}

// Updated createSingleSlider to fix slider handling
function createSingleSlider(containerElement, containerId, title, minId, maxId, minValue, maxValue, unit, color, type) {
    //var sliderType = (type === "single-slider") ? "single" : "double";
    var sliderType = "double";

    var sliderHTML = '<h3 style="color: ' + color + '; text-align: center; font-size: 18px; font-weight: 600">' + title + '</h3>' +
        '<input type="text" class="js-range-slider" id="' + containerId + '-' + title.toLowerCase() + '-slider' + '" name="my_range" value="" />' +
        '<div class="extra-controls">' +
        '<div class="form-group row mt-3" style="text-align:center; color:#1d474b">';

    if (sliderType === "single") {
        sliderHTML += '<div class="col single-slider">' +
            '<div class="input-container">' +
            '<label style="font-size:14px; margin-right: 10px;" for="' + minId + '">Current Value:</label>' +
            '<input type="text" id="' + minId + '" class="form-control center input-min" value="' + minValue + '" />' +
            '</div>' +
            '</div>';
    } else {
        sliderHTML += '<div class="col">' +
            '<div class="input-container">' +
            '<label style="font-size:14px; margin-right: 10px;" for="' + minId + '">Minimum:</label>' +
            '<input type="text" id="' + minId + '" class="form-control center input-min" value="' + minValue + '" />' +
            '</div>' +
            '</div>' +
            '<div class="col">' +
            '<div class="input-container">' +
            '<label style="font-size:14px; margin-right: 10px;" for="' + maxId + '">Maximum:</label>' +
            '<input type="text" id="' + maxId + '" class="form-control center input-max" value="' + maxValue + '" />' +
            '</div>' +
            '</div>';
    }

    sliderHTML += '</div>' +
        '</div>' +
        '</div>';

    var rowElement = document.createElement('div');
    rowElement.classList.add('col-md-5', 'bs-slider');
    rowElement.style.position = 'relative';
    rowElement.innerHTML = sliderHTML;
    containerElement.appendChild(rowElement);

    // Initialize slider instance
    var sliderInstance = $('#' + containerId + '-' + title.toLowerCase() + '-slider').ionRangeSlider({
        type: sliderType,
        min: minValue,
        max: maxValue,
        from: minValue,
        to:  maxValue,
        grid: true,
        grid_num: 10,
        keyboard: true,
        postfix: unit,
        prettify_separator: ",",
        skin: 'round',
        disable: false,
        onChange: function (data) {
            // Update input fields
            $('#' + minId).val(data.from);
            if (sliderType === 'double') {
                $('#' + maxId).val(data.to);
            }

            // Trigger slider values change event
            $(document).trigger('sliderValuesChanged', [data.from, (sliderType === 'double') ? data.to : maxValue, title.toLowerCase()]);
        }
    }).data("ionRangeSlider");

    function resetSlider() {
        var defaultMinValue = minValue;
        var defaultMaxValue = (sliderType === 'double') ? maxValue : minValue;

        // Reset slider instance
        sliderInstance.update({
            from: defaultMinValue,
            to: defaultMaxValue,
            disable: true
        });

        // Reset input fields
        $('#' + minId).val(defaultMinValue);
        if (sliderType === 'double') {
            $('#' + maxId).val(defaultMaxValue);
        }

        // Trigger slider values change event with reset values
        $(document).trigger('sliderValuesChanged', [defaultMinValue, defaultMaxValue]);
    }

    var debounceDelay = 300;
    var debounceInputChange = debounce(function (val, updateType) {
        if (updateType === 'min') {
            sliderInstance.update({ from: val });
        } else if (updateType === 'max') {
            sliderInstance.update({ to: val });
        }

        // Trigger slider values change event with updated values
        $(document).trigger('sliderValuesChanged', [sliderInstance.result.from, sliderInstance.result.to, title.toLowerCase()]);
    }, debounceDelay);

    // Handle input changes with debounce
    $("#" + minId).on("input", function () {
        var val = parseFloat($(this).val());
        debounceInputChange(val, 'min');
    });

    $("#" + maxId).on("input", function () {
        var val = parseFloat($(this).val());
        debounceInputChange(val, 'max');
    });

    sliders[containerId + '-' + title.toLowerCase() + '-slider'] = {
        instance: sliderInstance,
        reset: resetSlider
    };
}




function handleActiveSliderChange(currentContainerId) {
    // Disable and reset all sliders
    Object.keys(sliders).forEach(function (sliderId) {
        var sliderData = sliders[sliderId];
        if (sliderData && sliderData.instance) {
            // Disable slider
            sliderData.instance.update({ disable: true });
            // Reset slider values
            sliderData.reset();

            var sliderContainer = document.getElementById(sliderId);
            if (sliderContainer) {
                var sliderInputs = sliderContainer.querySelectorAll('.input-min, .input-max');
                sliderInputs.forEach(function (input) {
                    input.disabled = true; // Disable inputs
                });
            }
        }
    });

    // Enable only the current slider
    var currentSliderId = currentContainerId + '-slider';
    if (sliders[currentSliderId]) {
        sliders[currentSliderId].instance.update({ disable: false });
        var currentSliderContainer = document.getElementById(currentContainerId);
        if (currentSliderContainer) {
            var sliderInputs = currentSliderContainer.querySelectorAll('.input-min, .input-max');
            sliderInputs.forEach(function (input) {
                input.disabled = false; // Enable inputs
            });
        }
    }
}


// Debounce function
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
