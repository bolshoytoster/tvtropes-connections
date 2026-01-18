This is a greasemonkey script that adds a button for each character on a TV Tropes characters page, which will find other pieces of media that have similar characters.

This works by iterating through all of the tropes of the given character, and counting other shows/films/whatevers that have characters with the same tropes.

https://github.com/user-attachments/assets/b69e92c2-4347-4024-b84d-3de23f01cc77

Note: when you first press the button, this will send a HTTP request for _each_ trope under the given character, which could be quite a few. It will also send a few when you click one of the other buttons. I'm not sure if TV Tropes has bot protection, but it would still kind to use this sparingly.

## TODOs

- Make the UI a bit better (I could use some feedback)

- Maybe weight it towards smaller shows (ones with fewer tropes listed), since it currently skews heavily towards shows that have a large TV Tropes presence (Buffy, Star Trek, Doctor Who). This might require extra network requests through, and this is already pretty heavy.
