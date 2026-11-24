
const DATA_URL = "./data/menu.json";

const categories = [
    { key: "all", label: "همه" },
    { key: "foods", label: "غذاها" },
    { key: "breakfast", label: "صبحانه" },
    { key: "cafe", label: "کافه شاهر" },
    { key: "drinks", label: "نوشیدنی‌ها" },
    { key: "appetizers", label: "پیش‌غذا" },
    { key: "salads", label: "سالاد" }
];

const categoryNav = document.getElementById("categoryNav");
const sectionTitle = document.getElementById("sectionTitle");
const itemCount = document.getElementById("itemCount");
const menuStatus = document.getElementById("menuStatus");
const menuContainer = document.getElementById("menuContainer");

let menuData = null;
let activeCategory = "all";
let activeSubcategory = "all";

const subcategoryNav = createElement("nav", "subcategory-nav");
subcategoryNav.id = "subcategoryNav";
categoryNav.insertAdjacentElement("afterend", subcategoryNav);

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;

    if (text !== undefined && text !== null) {
        element.textContent = text;
    }

    return element;
}

function getGroups(category) {
    if (!menuData) return [];

    const keys = category === "all"
        ? categories
            .filter(item => item.key !== "all")
            .map(item => item.key)
        : [category];

    return keys.flatMap(key => {
        const groups = menuData[key];

        return Array.isArray(groups) ? groups : [];
    }).filter(group =>
        Array.isArray(group.items) && group.items.length > 0
    );
}

function hasSubcategories(category) {
    return category === "foods" || category === "breakfast";
}

function getVisibleGroups() {
    const groups = getGroups(activeCategory);

    if (
        activeCategory === "all" ||
        !hasSubcategories(activeCategory) ||
        activeSubcategory === "all"
    ) {
        return groups;
    }

    return groups.filter(group =>
        group.name === activeSubcategory
    );
}

function createImage(item, priority = false) {
    const wrapper = createElement("div", "menu-image");

    if (item.image) {
        const image = document.createElement("img");

        image.src = "./" + item.image;
        image.alt = item.name || "";

        image.decoding = "async";

        if (priority) {
            image.loading = "eager";
            image.fetchPriority = "high";
        } else {
            image.loading = "lazy";
            image.fetchPriority = "auto";
        }

        image.onerror = () => {
            image.remove();
            wrapper.classList.add("image-placeholder");
        };

        wrapper.appendChild(image);
    } else {
        wrapper.classList.add("image-placeholder");
    }

    return wrapper;
}

function createVariants(item) {
    const container = createElement("div", "variants");

    if (!Array.isArray(item.variants)) {
        return container;
    }

    item.variants.forEach(variant => {
        const row = createElement("div", "variant-row");

        const name = createElement(
            "span",
            "variant-name",
            variant.name || ""
        );

        const priceBox = createElement(
            "div",
            "variant-price-box"
        );

        const priceText = variant.price > 0
            ? Number(variant.price).toLocaleString("fa-IR") + " هزار تومان"
            : "";

        const price = createElement(
            "span",
            "variant-price",
            priceText
        );

        priceBox.appendChild(price);

        if (variant.available === false) {
            row.classList.add("unavailable");

            priceBox.appendChild(
                createElement(
                    "span",
                    "unavailable-stamp",
                    "ناموجود"
                )
            );
        }

        row.appendChild(name);
        row.appendChild(priceBox);

        container.appendChild(row);
    });

    return container;
}

function createItemCard(item, priority = false) {
    const card = createElement("article", "menu-card");

    const content = createElement(
        "div",
        "menu-card-content"
    );

    const name = createElement(
        "h3",
        "menu-item-name",
        item.name || ""
    );

    content.appendChild(name);

    if (item.description && item.description.trim()) {
        content.appendChild(
            createElement(
                "p",
                "menu-item-description",
                item.description
            )
        );
    }

    content.appendChild(createVariants(item));

    card.appendChild(createImage(item, priority));
    card.appendChild(content);

    return card;
}

function renderNavigation() {
    categoryNav.innerHTML = "";

    categories.forEach(category => {
        if (
            category.key !== "all" &&
            getGroups(category.key).length === 0
        ) {
            return;
        }

        const button = createElement(
            "button",
            "category-button",
            category.label
        );

        button.type = "button";

        if (activeCategory === category.key) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            activeCategory = category.key;
            activeSubcategory = "all";

            renderMenu();
        });

        categoryNav.appendChild(button);
    });
}

function renderSubcategories() {
    subcategoryNav.innerHTML = "";

    if (!hasSubcategories(activeCategory)) {
        subcategoryNav.hidden = true;
        return;
    }

    const groups = getGroups(activeCategory);

    if (groups.length === 0) {
        subcategoryNav.hidden = true;
        return;
    }

    subcategoryNav.hidden = false;

    const category = categories.find(
        item => item.key === activeCategory
    );

    const buttons = [
        {
            name: "همه " + category.label,
            key: "all"
        },
        ...groups.map(group => ({
            name: group.name,
            key: group.name
        }))
    ];

    buttons.forEach(group => {
        const button = createElement(
            "button",
            "subcategory-button",
            group.name
        );

        button.type = "button";

        if (activeSubcategory === group.key) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            activeSubcategory = group.key;

            renderMenu();
        });

        subcategoryNav.appendChild(button);
    });
}

function renderMenu() {
    if (!menuData) return;

    renderNavigation();
    renderSubcategories();

    const groups = getVisibleGroups();

    menuContainer.innerHTML = "";

    let totalItems = 0;
    let firstGroup = true;

    groups.forEach(group => {
        const section = createElement(
            "section",
            "menu-group"
        );

        const heading = createElement(
            "h2",
            "group-title",
            group.name || ""
        );

        const grid = createElement(
            "div",
            "menu-grid"
        );

        group.items.forEach((item, index) => {
            const priority = firstGroup && index < 4;

            grid.appendChild(
                createItemCard(item, priority)
            );

            totalItems++;
        });

        firstGroup = false;

        section.appendChild(heading);
        section.appendChild(grid);

        menuContainer.appendChild(section);
    });

    const selectedCategory = categories.find(
        category => category.key === activeCategory
    );

    if (activeCategory === "all") {
        sectionTitle.textContent = "مجموعه غذایی شاهر";
    } else if (
        hasSubcategories(activeCategory) &&
        activeSubcategory !== "all"
    ) {
        sectionTitle.textContent = activeSubcategory;
    } else {
        sectionTitle.textContent = selectedCategory.label;
    }

    itemCount.textContent =
        totalItems.toLocaleString("fa-IR") + " آیتم";

    menuStatus.hidden = totalItems > 0;

    if (totalItems === 0) {
        menuStatus.textContent =
            "در حال حاضر آیتمی برای نمایش وجود ندارد.";
    }
}

async function loadMenu() {
    menuStatus.hidden = false;
    menuStatus.textContent = "در حال دریافت منو...";

    try {
        const response = await fetch(
            DATA_URL + "?t=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("خطا در دریافت اطلاعات منو");
        }

        menuData = await response.json();

        renderMenu();

    } catch (error) {
        console.error("Menu loading error:", error);

        menuStatus.hidden = false;

        menuStatus.textContent =
            "دریافت اطلاعات منو با مشکل مواجه شد. لطفاً دوباره تلاش کنید.";
    }
}

loadMenu();
