const createElemWithText = (elem = "p", context = "", classname = "") => {
    const element = document.createElement(elem);
    element.textContent = context;
    classname.length > 0
      ? (element.className = classname)
      : (element.className = "");
    return element;
  };
  
  const createSelectOptions = (data = []) => {
    const selector = [];
    for (let each of data) {
      let option = document.createElement("option");
      option.value = each.id;
      option.textContent = each.name;
      selector.push(option);
    }
    if (!data.length) return;
    return selector;
  };
  
  const toggleCommentSection = (postID) => {
    let selector = null;
    document.querySelectorAll(`[data-post-id="${postID}"]`).forEach((elem) => {
      if (elem.tagName.toLowerCase() === "section") {
        elem.classList.toggle("hide");
        selector = elem;
      }
    });
    if (!postID) return;
    return selector;
  };
  
  const toggleCommentButton = (postID) => {
    let selector = null;
    document.querySelectorAll(`[data-post-id="${postID}"]`).forEach((elem) => {
      if (elem && elem.tagName.toLowerCase() === "button") {
        elem.textContent =
          elem.textContent === "Show Comments"
            ? "Hide Comments"
            : "Show Comments";
        selector = elem;
      }
    });
    if (!postID) return;
    return selector;
  };
  
  const deleteChildElements = (parentElement = {}) => {
    if (
      !(typeof parentElement === "object") ||
      !parentElement ||
      Array.isArray(parentElement) ||
      !parentElement.tagName
    )
      return;
    while (parentElement?.lastElementChild) {
      parentElement.removeChild(parentElement.lastElementChild);
    }
    if (!parentElement) return;
    return parentElement;
  };
  
  const addButtonListeners = () => {
    let $main = document.querySelector("main");
    let $buttons = $main.querySelectorAll("button");
    if ($buttons.length) {
      $buttons.forEach(($btn) => {
        const postId = $btn.dataset.postId;
        $btn.addEventListener("click", (e) => {
          toggleComments(e, postId);
        });
      });
    }
    return $buttons;
  };
  
  const removeButtonListeners = () => {
    let $main = document.querySelector("main");
    let $buttons = $main.querySelectorAll("button");
  
    if ($buttons.length) {
      $buttons.forEach(($btn) => {
        const Id = $btn.dataset.id;
        $btn.removeEventListener("click", () => {
          toggleComments("click", Id);
        });
      });
    }
  
    return $buttons;
  };
  
  const createComments = (comments) => {
    if (!comments) return;
    const $fragment = document.createDocumentFragment();
    comments.forEach((comment) => {
      const $article = document.createElement("article");
      const $h3 = createElemWithText("h3", comment.name);
      const $p1 = createElemWithText("p", comment.body);
      const $p2 = createElemWithText("p", `From: ${comment.email}`);
      $article.appendChild($h3);
      $article.appendChild($p1);
      $article.appendChild($p2);
      $fragment.appendChild($article);
    });
  
    return $fragment;
  };
  
  const populateSelectMenu = (users) => {
    if (!users) return;
    const $selectMenu = document.querySelector("#selectMenu");
    createSelectOptions(users).forEach(($option) =>
      $selectMenu.appendChild($option)
    );
    return $selectMenu;
  };
  
  const getUsers = async () => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
      if (!response.ok) throw new Error("No users");
      return await response.json();
    } catch (err) {
      return console.error(err);
    }
  };
  
  const getUserPosts = async (userID) => {
    if (!userID) return;
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userID}/posts`
      );
      if (!response.ok) throw new Error("No posts");
      return await response.json();
    } catch (err) {
      return console.error(err);
    }
  };
  
  const getUser = async (userID) => {
    if (!userID) return;
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userID}`
      );
      if (!response.ok) throw new Error("No user");
      return await response.json();
    } catch (err) {
      return console.error(err);
    }
  };
  
  const getPostComments = async (postID) => {
    if (!postID) return;
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${postID}/comments`
      );
      if (!response.ok) throw new Error("No comments");
      return await response.json();
    } catch (err) {
      return console.error(err);
    }
  };
  
  const displayComments = async (postId) => {
    if (!postId) return;
    const $section = document.createElement("section");
    $section.dataset.postId = postId;
    $section.classList.add("comments");
    $section.classList.add("hide");
    const comments = await getPostComments(postId);
    const $fragment = createComments(comments);
    $section.append($fragment);
    return $section;
  };
  
  const createPosts = async (posts) => {
    if (!posts) return;
    const $fragment = document.createDocumentFragment();
  
    const getArticle = async (post) => {
      const $article = document.createElement("article");
      const $h2 = createElemWithText("h2", post.title);
      const $p1 = createElemWithText("p", post.body);
      const $p2 = createElemWithText("p", `Post ID: ${post.id}`);
      const author = await getUser(post.userId);
      const $p3 = createElemWithText(
        "p",
        `Author: ${author.name} with ${author.company.name}`
      );
      const $p4 = createElemWithText("p", author.company.catchPhrase);
      const $button = createElemWithText("button", "Show Comments");
      $button.dataset.postId = post.id;
      $article.append($h2, $p1, $p2, $p3, $p4, $button);
      const $section = await displayComments(post.id);
      $article.append($section);
      return $article;
    };
  
    const articles = await Promise.all(posts.map((post) => getArticle(post)));
    articles.forEach((article) => $fragment.append(article));
    return $fragment;
  };
  
  const displayPosts = async (posts) => {
    const $fragment = document.createDocumentFragment();
    const $main = document.querySelector("main");
    $fragment.append(await createPosts(posts));
    $main.append($fragment);
    if (!posts) {
      const $def = document.querySelector(".default-text");
      return $def;
    }
    return $fragment;
  };
  
  const toggleComments = (event, postId) => {
    if (!postId || !event) return;
    event.target.listener = true;
    const $section = toggleCommentSection(postId);
    const $button = toggleCommentButton(postId);
    return [$section, $button];
  };
  
  const refreshPosts = async (posts) => {
    if (!posts) return;
    const $removeButtons = removeButtonListeners();
    let $main = document.querySelector("main");
    $main = deleteChildElements($main);
    const $fragment = await displayPosts(posts);
    const $addButtons = addButtonListeners();
    return [$removeButtons, $main, $fragment, $addButtons];
  };
  
  const selectMenuChangeEventHandler = async (event) => {
    let userId = event?.target.value || 1;
    let posts = await getUserPosts(userId);
    let refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
  };
  
  const initPage = async () => {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
  };
  
  const initApp = async () => {
    await initPage();
    const selectMenu = document.querySelector("#selectMenu");
    selectMenu?.addEventListener("change", selectMenuChangeEventHandler);
  };
  
  initApp();