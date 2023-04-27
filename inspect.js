const xPathFinder = () => {
  const debug = function (msg) {
    if (xPathFinderM.debugMode) {
      console.log(msg);
    }
  };

  class Inspector {
    constructor() {
      this.win = window;
      this.doc = window.document;

      this.draw = this.draw.bind(this);
      this.setOptions = this.setOptions.bind(this);

      this.cssNode = "xpath-css";
      this.overlayElement = "xpath-overlay";
    }

    getXPath(el) {
      let xpath = "";
      let pos, siblings;

      while (el !== document) {
        pos = 1;
        siblings = el.parentNode.childNodes;

        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling.nodeName === el.nodeName) {
            if (sibling === el) {
              xpath =
                "/" +
                el.nodeName.toLowerCase() +
                "[" +
                pos +
                "]" +
                xpath.toLowerCase();
              break;
            } else {
              pos++;
            }
          }
        }

        el = el.parentNode;
      }

      return xpath;
    }

    setOptions(options) {
      this.options = options;
      let position = "bottom:0;left:0";
      switch (options.position) {
        case "tl":
          position = "top:0;left:0";
          break;
        case "tr":
          position = "top:0;right:0";
          break;
        case "br":
          position = "bottom:0;right:0";
          break;
        default:
          break;
      }
      this.styles = `body *{cursor:crosshair!important;}#xpath-content{${position};cursor:initial!important;padding:10px;background:gray;color:white;position:fixed;font-size:14px;z-index:10000001;}`;
      this.activate();
    }

    createOverlayElements() {
      const overlayStyles = {
        background: "rgba(120, 170, 210, 0.7)",
        padding: "rgba(77, 200, 0, 0.3)",
        margin: "rgba(255, 155, 0, 0.3)",
        border: "rgba(255, 200, 50, 0.3)",
      };

      this.container = this.doc.createElement("div");
      this.node = this.doc.createElement("div");
      this.border = this.doc.createElement("div");
      this.padding = this.doc.createElement("div");
      this.content = this.doc.createElement("div");

      this.border.style.borderColor = overlayStyles.border;
      this.padding.style.borderColor = overlayStyles.padding;
      this.content.style.backgroundColor = overlayStyles.background;

      Object.assign(this.node.style, {
        borderColor: overlayStyles.margin,
        pointerEvents: "none",
        position: "fixed",
      });

      this.container.id = this.overlayElement;
      this.container.style.zIndex = 10000000;
      this.node.style.zIndex = 10000000;

      this.container.appendChild(this.node);
      this.node.appendChild(this.border);
      this.border.appendChild(this.padding);
      this.padding.appendChild(this.content);
    }

    removeOverlay() {
      const overlayHtml = document.getElementById(this.overlayElement);
      overlayHtml && overlayHtml.remove();
    }

    activate() {
      this.createOverlayElements();
      this.doc.body.appendChild(this.container);

      this.win.addEventListener("mousemove", this.draw);
      this.win.addEventListener("keydown", this.removeOverlay.bind(this));
    }

    deactivate() {
      this.win.removeEventListener("mousemove", this.draw);
      this.win.removeEventListener("keydown", this.removeOverlay.bind(this));

      this.container.remove();
    }

    draw(event) {
      const target = event.target;
      const rect = target.getBoundingClientRect();
      //   console.log(target.clientHeight);

      const borderSize = 2;
      const paddingSize = 2;

      Object.assign(this.node.style, {
        top: `${rect.top - borderSize}px`,
        left: `${rect.left - borderSize}px`,
        width: `${rect.width + borderSize * 2}px`,
        height: `${rect.height + borderSize * 2}px`,
      });

      Object.assign(this.border.style, {
        top: `${borderSize}px`,
        left: `${borderSize}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });

      Object.assign(this.padding.style, {
        top: `${paddingSize}px`,
        left: `${paddingSize}px`,
        width: `${rect.width - paddingSize * 2}px`,
        height: `${rect.height - paddingSize * 2}px`,
      });
      const xPathCalc = this.getXPath(target);
      this.content.style.height = `${target.clientHeight}px`;
      this.content.innerHTML = `<span style="position:relative;z-index:1000000000;" id="__data">${xPathCalc}</span>`;
      // window.parent.postMessage({ xPathCalc }, "*");
    }
  }

  const xPathFinderM = {
    debugMode: false,
    start: function (options) {
      this.inspector = new Inspector();
      this.inspector.setOptions(options);
    },

    stop: function () {
      if (this.inspector) {
        this.inspector.deactivate();
      }
    },
  };

  return xPathFinderM;
};
