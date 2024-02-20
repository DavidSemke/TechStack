(()=>{"use strict";function e(e,t){const o=document.querySelector(e);o&&document.querySelector(t).addEventListener("click",(()=>{o.classList.contains("-open")?(o.classList.remove("-open"),o.classList.add("-closed")):o.classList.contains("-closed")&&(o.classList.remove("-closed"),o.classList.add("-open"))}))}function t(e,t,n){o(e,t);const r=`${e}__error-container`,s=document.getElementById(t).parentElement;if(n){const t=document.createElement("div");t.classList.add(r);for(const o of n){const n=document.createElement("div");n.classList.add(`${e}__error`),n.textContent=o.msg,t.append(n)}s.append(t)}}function o(e,t){const o=`${e}__error-container`,n=document.getElementById(t).parentElement,r=n.querySelector("."+o);r&&n.removeChild(r)}async function n(e,t,o,n=null){const r=await fetch(e,{method:t,body:new FormData(o)});if(!r.ok&&400!==r.status)throw new Error("HTTP error - Status 500");r.redirected&&(window.location.href===r.url?window.location.reload():window.location.href=r.url);const s=r.headers.get("content-type");s&&s.includes("application/json")&&n&&n(await r.json())}const r=function(){const e=function(){let e=null,t=null;return{enqueue:function(o){const n=function(e,t=null){return{value:e,next:t}}(o);e?(t.next=n,t=n):(e=n,t=n)},dequeue:function(){if(!e)return;const o=e;return e=e.next,e||(t=null),o.value},isEmpty:function(){return null===e}}}();let t=!1;return{enqueue:async function(o){if(e.enqueue(o),!t){for(t=!0;!e.isEmpty();){const t=e.dequeue();await t()}t=!1}}}}();function s(e,t){t.replies&&t.replies.length&&e.querySelector(".comment-card__view-replies-button").addEventListener("click",(()=>{const t=e.nextSibling;let o=t;t.classList.contains("blog-post-page__reply-create-form")&&(o=t.nextSibling),o.classList.contains("-gone")?o.classList.remove("-gone"):o.classList.add("-gone")}));const o=e.querySelector(".comment-card__reply-button");o&&o.addEventListener("click",(()=>{const o=document.querySelector(".blog-post-page__reply-create-form");o?(o.previousSibling!==e&&a(e,t),o.parentElement.removeChild(o)):a(e,t)}));const n=e.querySelector(".comment-card__like-button"),s=e.querySelector(".comment-card__dislike-button"),i=t.reaction;let u=i?i._id:null;const d=i?i.reaction_type:null;let m=!1,p=!1;"Like"===d?(m=!0,n.classList.add("-colorful")):"Dislike"===d&&(p=!0,s.classList.add("-colorful"));let f=m,g=p;const b=e.querySelector(".comment-card__like-reaction-form");b.addEventListener("submit",(async e=>{e.preventDefault(),c(g,f,[n],[s]),g=!1,f=!f,r.enqueue((async()=>{await l(b,p,m,u,(e=>{u=e.reactionId})),p=!1,m=!m}))}));const _=e.querySelector(".comment-card__dislike-reaction-form");_.addEventListener("submit",(async e=>{e.preventDefault(),c(f,g,[s],[n]),f=!1,g=!g,r.enqueue((async()=>{await l(_,m,p,u,(e=>{u=e.reactionId})),m=!1,p=!p}))}))}function c(e,t,o,n){if(t)for(const e of o){e.classList.remove("-colorful");const t=e.querySelector(".icon-element__label");t.textContent=parseInt(t.textContent)-1}else if(e){for(const e of o){e.classList.add("-colorful");const t=e.querySelector(".icon-element__label");t.textContent=parseInt(t.textContent)+1}for(const e of n){e.classList.remove("-colorful");const t=e.querySelector(".icon-element__label");t.textContent=parseInt(t.textContent)-1}}else for(const e of o){e.classList.add("-colorful");const t=e.querySelector(".icon-element__label");t.textContent=parseInt(t.textContent)+1}}async function l(e,t,o,r,s){const c=`/users/${backendData.loginUser.username}/reactions`;o?await n(`${c}/${r}`,"delete",e,s):t?await n(`${c}/${r}`,"put",e,s):await n(c,"post",e,s)}function a(e,t){const o=document.querySelector(".blog-post-page__comment-create-form").cloneNode(!0),n=document.createElement("input");n.name="reply-to",n.type="hidden",n.value=t._id,o.append(n),o.classList.remove("blog-post-page__comment-create-form"),o.classList.add("blog-post-page__reply-create-form"),i(o),e.parentElement.insertBefore(o,e.nextSibling)}function i(e){e.addEventListener("submit",(o=>{o.preventDefault(),n(`/blog-posts/${backendData.blogPost._id}/comments`,"post",e,(o=>{if(t("form-textarea","content",o.errors),!o.errors)if(e.classList.contains("blog-post-page__reply-create-form")){let t=e.nextSibling;t||(t=document.createElement("div"),t.classList.add("blog-post-page__reply-container"),e.parentElement.append(t));const n=t.querySelectorAll(".comment-card");t.innerHTML=o.renderedHTML,s(t.querySelector(".comment-card"),o.commentData);for(const e of n)t.append(e);t.classList.contains("-gone")&&t.classList.remove("-gone"),e.parentElement.removeChild(e)}else{const t=document.createElement("div");t.classList.add("blog-post-page__comment-string"),t.innerHTML=o.renderedHTML,s(t.querySelector(".comment-card"),o.commentData),e.parentElement.insertBefore(t,e.nextSibling)}}))}))}function u(e,t,o=!1){const n=Array.from(t.querySelectorAll(".blog-post-item"));if("title"===e)n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__title").textContent;return t.querySelector(".blog-post-item__title").textContent.localeCompare(o)}));else if("last-mod-date"===e)n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__last-modified").textContent;return d(t.querySelector(".blog-post-item__last-modified").textContent,o)}));else if(o)switch(e){case"publish-date":n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__published").textContent;return d(t.querySelector(".blog-post-item__published").textContent,o)}));break;case"likes":n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__likes .icon-element__label").textContent,n=t.querySelector(".blog-post-item__likes .icon-element__label").textContent;return parseInt(n)-parseInt(o)}));break;case"dislikes":n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__dislikes .icon-element__label").textContent,n=t.querySelector(".blog-post-item__dislikes .icon-element__label").textContent;return parseInt(n)-parseInt(o)}));break;case"total-comments":n.sort(((e,t)=>{const o=e.querySelector(".blog-post-item__total-comments .icon-element__label").textContent,n=t.querySelector(".blog-post-item__total-comments .icon-element__label").textContent;return parseInt(n)-parseInt(o)}))}t.innerHTML="",t.append(...n)}function d(e,t){const o=e.split("-").map((e=>parseInt(e))),n=t.split("-").map((e=>parseInt(e)));let r=0;for(let e=0;e<o.length;e++){if(o[e]<n[e]){r=-1;break}if(o[e]>n[e]){r=1;break}}return r}function m(e){const t=e.querySelectorAll(".blog-post-item"),o=document.querySelector(".user-blog-posts__right");for(const n of t)n.addEventListener("click",(e=>{p(e,o)})),n.querySelector(".blog-post-item__delete-button").addEventListener("click",(t=>{t.stopPropagation(),f(n,e)}))}function p(e,t){const o=e.currentTarget.id,n=[...backendData.publishedBlogPosts,...backendData.unpublishedBlogPosts].find((e=>e._id.toString()===o));document.querySelector(".blog-post-fragment__title").innerHTML=n.title;const r=document.querySelector(".blog-post-fragment__thumbnail");if(r.innerHTML="",n.thumbnail){const e=n.thumbnail,t=`data:${e.contentType};base64,${e.data}`,o=document.createElement("img");o.src=t,r.classList.remove("-empty"),r.append(o)}else r.classList.add("-empty"),r.textContent="Your thumbnail appears here";document.querySelector(".blog-post-fragment__content").innerHTML=n.content,t.classList.remove("-hidden")}function f(e,t){fetch(window.location.href+"/"+e.id,{method:"DELETE"}).then((o=>{if(!o.ok)throw new Error(`HTTP error - Status: ${o.status}`);if(t.removeChild(e),0===t.childElementCount){const e=t.parentElement;e.removeChild(t);const o=document.createElement("p");o.textContent="You have no blog posts here.",e.append(o)}})).catch((e=>{throw e}))}!function(){const e=document.querySelector(".navbar");if(!e)return;const t=e.querySelector(".searchbar__input");if(!t)return;const o=document.querySelector(".navbar-dropdown-container");t.addEventListener("input",(()=>{const e=t.value.split(" ").filter((e=>e)).map((e=>encodeURIComponent(e)));if(!e.length)return void(o.innerHTML="");const n="/blog-posts?keywords="+e.join(",");fetch(n,{method:"GET"}).then((e=>{if(!e.ok)throw new Error(`HTTP error - Status: ${e.status}`);return e.json()})).then((e=>{o.innerHTML=e.renderedHTML})).catch((e=>{throw e}))})),t.addEventListener("blur",(e=>{const t=e.relatedTarget;t&&o.contains(t)||o.classList.add("-gone")})),t.addEventListener("focus",(()=>{o.classList.remove("-gone")}))}(),e(".account-sidebar",".navbar__account-button"),e(".content-sidebar",".navbar__content-button"),function(){const e=document.querySelector(".logging-page");if(!e)return;const o=backendData.errors,n={username:{errors:[],formCompType:"form-input"},password:{errors:[],formCompType:"form-input"}},r=e.querySelector(".logging-form").action.split("/");if("login"===r[r.length-1])n.password.errors=o.map((e=>({msg:e})));else for(const e of o)n[e.path].errors.push(e);for(const[e,o]of Object.entries(n))t(o.formCompType,e,o.errors)}(),document.querySelector(".blog-post-page")&&(function(){const e=backendData.blogPost.reaction;let t=e?e._id:null;const o=e?e.reaction_type:null,n=document.querySelectorAll(".blog-post__like-button");let s=!1;if("Like"===o){s=!0;for(const e of n)e.classList.add("-colorful")}const a=document.querySelectorAll(".blog-post__dislike-button");let i=!1;if("Dislike"===o){i=!0;for(const e of a)e.classList.add("-colorful")}let u=s,d=i;const m=document.querySelectorAll(".blog-post__like-reaction-form");for(const e of m)e.addEventListener("submit",(async o=>{o.preventDefault(),c(d,u,n,a),d=!1,u=!u,r.enqueue((async()=>{await l(e,i,s,t,(e=>{t=e.reactionId})),i=!1,s=!s}))}));const p=document.querySelectorAll(".blog-post__dislike-reaction-form");for(const e of p)e.addEventListener("submit",(async o=>{o.preventDefault(),c(u,d,a,n),u=!1,d=!d,r.enqueue((async()=>{await l(e,s,i,t,(e=>{t=e.reactionId})),s=!1,i=!i}))}))}(),i(document.querySelector(".blog-post-page__comment-create-form")),function(){const e=document.querySelectorAll(".comment-card"),t=backendData.blogPost.comments;for(let o=0,n=0,r=0;o<e.length;o++){const c=e[o];let l=t[n];const a=l.replies;a.length?r>0?(l=a[r-1],r++,r===a.length+1&&(r=0,n++)):r++:n++,s(c,l)}}()),document.querySelector(".blog-post-form-page")&&(function(e){if(!document.querySelector(e))return;let t=backendData.blogPost.content||"";tinymce.init({selector:e,plugins:"lists link image table code help wordcount",menubar:"file edit view insert table tools help",toolbar:"undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist",promotion:!1,image_file_types:"jpeg,jpg,png,webp,gif",setup:e=>{e.on("init",(()=>{e.setContent(t),document.querySelector(".blog-post-fragment__content").innerHTML=e.getContent()})),e.on("change",(()=>{e.save(),document.querySelector(".blog-post-fragment__content").innerHTML=e.getContent()})),e.on("submit",(()=>{document.getElementById("word-count").value=e.plugins.wordcount.getCount()}))}})}(".tinymce-app"),function(){const e=document.querySelector(".blog-post-form-page__left .blog-post-form-page__body"),t=document.querySelector(".blog-post-form-page__right .blog-post-form-page__body");t.style.maxHeight=e.offsetHeight+"px",t.style.maxWidth=e.offsetWidth+"px"}(),function(){const e=document.querySelector(".blog-post-form__metadata"),t=document.querySelector(".blog-post-form__content");document.querySelector(".blog-post-form-page__metadata-tab").addEventListener("click",(()=>{e.classList.contains("-gone")&&(t.classList.add("-gone"),e.classList.remove("-gone"))})),document.querySelector(".blog-post-form-page__content-tab").addEventListener("click",(()=>{t.classList.contains("-gone")&&(e.classList.add("-gone"),t.classList.remove("-gone"))}))}(),function(){const e=document.querySelector(".blog-post-fragment__title"),t=document.getElementById("title");e.textContent=t.value,t.addEventListener("change",(()=>{e.textContent=t.value}))}(),function(){const e=document.querySelector(".blog-post-form");function r(t){const o=e.querySelectorAll(".blog-post-form__pre-method");for(const t of o)e.removeChild(t);const n=document.createElement("input");n.classList.add("blog-post-form__pre-method"),n.name="pre-method",n.type="hidden",n.value=t,e.append(n)}document.querySelector(".navbar__discard-button").addEventListener("click",(()=>{r("discard")})),document.querySelector(".navbar__save-button").addEventListener("click",(()=>{r("save")})),document.querySelector(".navbar__publish-button").addEventListener("click",(()=>{r("publish")})),e.addEventListener("keypress",(e=>{"Enter"===e.key&&e.preventDefault()})),e.addEventListener("submit",(async r=>{r.preventDefault();let s="PUT",c=window.location.href;if(!Object.keys(backendData.blogPost).length){s="POST";const e=c.split("/");e.pop(),c=e.join("/")}let l=!1;const a={title:{errors:[],formCompType:"form-input"},thumbnail:{errors:[],formCompType:"form-input"},keywords:{errors:[],formCompType:"form-textarea"},content:{errors:[],formCompType:"form-textarea"},"word-count":{errors:[],formCompType:null}};if(await n(c,s,e,(e=>{l=!0;for(const t of e.errors)a[t.path].errors.push(t);a.content.errors.push(...a["word-count"].errors),delete a["word-count"];for(const[e,o]of Object.entries(a))t(o.formCompType,e,o.errors)})),!l)for(const[e,t]of Object.entries(a))o(t.formCompType,e)}))}()),function(){if(!document.querySelector(".profile-page"))return;const e=document.querySelector(".profile__edit-button"),o=document.querySelector(".profile__secondary"),r=document.querySelector(".profile-form");e.addEventListener("click",(()=>{r.classList.contains("-gone")&&(o.classList.add("-gone"),r.classList.remove("-gone"))})),document.querySelector(".profile-form__cancel").addEventListener("click",(()=>{if(o.classList.contains("-gone")){r.classList.add("-gone"),o.classList.remove("-gone");const{username:e,bio:t,keywords:n}=backendData.user;document.getElementById("username").value=e,t&&(document.getElementById("bio").value=t),n.length&&(document.getElementById("keywords").value=n.join(" "))}})),r.addEventListener("submit",(e=>{e.preventDefault(),n(`/users/${backendData.user.username}`,"PUT",r,(e=>{const o={"profile-pic":{errors:[],formCompType:"form-input"},username:{errors:[],formCompType:"form-input"},bio:{errors:[],formCompType:"form-textarea"},keywords:{errors:[],formCompType:"form-textarea"}};for(const t of e.errors)o[t.path].errors.push(t);for(const[e,n]of Object.entries(o))t(n.formCompType,e,n.errors)}))}))}(),function(){if(!document.querySelector(".user-blog-posts-page"))return;document.querySelector(".user-blog-posts-page__searchbar .searchbar__input").addEventListener("input",(e=>{const t=document.querySelectorAll(".blog-post-item"),o=e.currentTarget.value.trim().toLowerCase();if(""===o)for(const e of t)e.classList.remove("-gone");else for(const e of t){const t=e.querySelector(".blog-post-item__title").textContent.toLowerCase();new RegExp(o).test(t)?e.classList.remove("-gone"):e.classList.add("-gone")}})),function(){const e=document.querySelector(".user-blog-posts-page__sort-selector"),t=document.querySelector(".user-blog-posts__published.blog-post-list"),o=document.querySelector(".user-blog-posts__unpublished.blog-post-list");e.addEventListener("change",(e=>{const n=e.target.value.trim().toLowerCase();u(n,t,!0),u(n,o)}))}(),function(){const e=document.querySelector(".user-blog-posts__published-container"),t=document.querySelector(".user-blog-posts__unpublished-container"),o=document.querySelector(".user-blog-posts__published-tab");o.classList.add("-bold");const n=document.querySelector(".user-blog-posts__unpublished-tab");o.addEventListener("click",(()=>{o.classList.add("-bold"),n.classList.remove("-bold"),t.classList.add("-gone"),e.classList.remove("-gone")})),n.addEventListener("click",(()=>{n.classList.add("-bold"),o.classList.remove("-bold"),e.classList.add("-gone"),t.classList.remove("-gone")}))}();const e=document.querySelector(".user-blog-posts__published"),t=document.querySelector(".user-blog-posts__unpublished");m(e),m(t)}()})();