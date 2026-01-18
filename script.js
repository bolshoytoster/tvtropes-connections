// ==UserScript==
// @name     TV Tropes connection finder
// @version  1
// @grant    none
// @include  https://tvtropes.org/pmwiki/pmwiki.php/Characters/*
// ==/UserScript==

for (const folder of document.getElementsByClassName("folder")) {
  const find_button = document.createElement("button");
  find_button.textContent = "Find with similar characters";
  find_button.onclick = () => {
    const results_div = document.createElement("div");
    find_button.replaceWith(results_div);

    const mediums = {};
    const connections = {};

    function find_connections(text) {
      let link_start = 0;
      while (link_start = text.indexOf("m><a ", link_start) + 1) {
        const href_start = text.indexOf("f=", link_start) + 3;
        const href_end = text.indexOf("'", href_start);
        const href = text.slice(href_start, href_end);

        const name_start = text.indexOf(">", href_end) + 1;
        const name = text.slice(name_start, text.indexOf("<", name_start));

        if (connections[href]) {
          connections[href].link.innerHTML = name + ": " + ++connections[href].count;
          while (
            connections[href].link.previousSibling?.href
            	&& connections[connections[href].link.previousSibling.href.slice(20)].count < connections[href].count
          )
            results_div.insertBefore(connections[href].link, connections[href].link.previousSibling);
        } else {
          const link = document.createElement("a");
          link.innerHTML = name + ": 1";
          link.href = href;
          link.style.display = "block";

          connections[href] = { link, count: 1 };

          results_div.appendChild(link);
        }
      }
    }

		function create_medium_button(name, source) {
      const button = document.createElement("button");
      // Names in TV Tropes are inconsistent. We need to canonicalize some of these.
      // (going through innerHTML also decodes html entities)
      button.innerHTML = name
        .replace("Films", "Film")
        .replace("Live-Action", "Live Action")
      	.replace("–", "—")
        .replace("Animated", "Animation");

      if (mediums[button.textContent])
        mediums[button.textContent].sources.push(source);
      else {
        button.onclick = () => {
          button.remove();

          for (const [already_fetched, data] of mediums[button.textContent].sources)
            if (already_fetched)
              find_connections(data);
            else
              fetch("https://tvtropes.org/pmwiki/pmwiki.php/" + data).then(
                async response => find_connections(await response.text())
             	);
        };

        mediums[button.textContent] = { button, sources: [source] };

        results_div.appendChild(button);
      }
    }


    for (const twikilink of folder.getElementsByClassName("twikilink")) {
      if (!twikilink.href.startsWith("Main/", 39))
        continue;

      fetch(twikilink.href).then(async response => {
        const text = await response.text();


        const subpages_start = text.indexOf("ges:<");
        if (subpages_start != -1) {
          const subpages_end = text.indexOf("</u", subpages_start);
          const subpages = text.slice(subpages_start, subpages_end);
          let href_start = subpages.indexOf(" <a") + 47;
          do {
            const href_end = subpages.indexOf("'", href_start);
            const href = subpages.slice(href_start, href_end);

            const name_start = subpages.indexOf(">", href_end) + 1;
            const name_end = subpages.indexOf("<", name_start);

            create_medium_button(subpages.slice(name_start, name_end), [false, href]);

            href_start = subpages.indexOf(" <a", name_end) + 47;
          } while (href_start != 46)
        }


        let folder_start = text.indexOf("efolder('", text.indexOf("s</h", subpages_start));
        while (folder_start != -1) {
          const name_start = text.indexOf("p", folder_start + 25) + 20;
          const name_end = text.indexOf("&n", name_start);
          const name = text.slice(name_start, name_end);

          folder_start = text.indexOf("efolder('", folder_start + 1);

          if (name != "Trope Namer") {
          	const folder = text.slice(name_end, folder_start);

          	create_medium_button(text.slice(name_start, name_end).trimEnd(), [true, folder]);
          }
        }
      });
    }
  };

  folder.prepend(find_button);
}
