// Please use event listeners to run functions.
document.addEventListener('onLoad', function (obj) {
  // obj will be empty for chat widget
  // this will fire only once when the widget loads
});

const THREAD_START_CLASS = "message--thread-start";
const THREAD_END_CLASS = "message--thread-end";
const THREAD_ACTIVE_CLASS = "meta--thread-active";
const THREAD_ACTIVE_SHOW_CLASS = "meta--thread-active--show";

const LAST_SENDER_KILL_DISPLAY_NAME_THRESHOLD = 10;
const MESSAGE_HIDE_TIMEOUT = 15 * 1000 + 250;

document.addEventListener('onEventReceived', function (obj) {
  const message = document.querySelector('.message-container:last-child');

  handleGroups(obj, message);
  handleMarkdown(obj, message);
});

let lastSender = undefined;
let lastSenderCount;

function handleGroups(obj, message) {
  const {
    'display-name': displayName,
    color
  } = obj.detail.tags;

  message.classList.add(THREAD_START_CLASS);
  message.classList.add(THREAD_END_CLASS);

  const lastSenderMessage = message.previousElementSibling;

  if (lastSender === displayName) {
    lastSenderMessage.classList.remove(THREAD_END_CLASS);
    message.classList.remove(THREAD_START_CLASS);

    lastSenderCount++;

    if (lastSenderCount <= LAST_SENDER_KILL_DISPLAY_NAME_THRESHOLD) {
      const meta = message.querySelector(".meta");
      meta.classList.add(THREAD_ACTIVE_CLASS);

      setTimeout(() => {
        const siblingMeta = message.nextSibling?.querySelector(".meta");
        console.log(siblingMeta)
        if (siblingMeta) {
          siblingMeta.classList.add(THREAD_ACTIVE_SHOW_CLASS);
        } else {
          lastSenderCount = 0;
          lastSender = undefined;
        }
      }, MESSAGE_HIDE_TIMEOUT);
    }
  } else {
    lastSenderCount = 1;
    lastSender = displayName;
  }
}


function getSurroundingRegex(symbol) {
  // Escape special regex characters properly
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use (.+?) for a non-greedy capture that includes any character
  return new RegExp(`${escaped}(.+?)${escaped}`, 'g');
}

function handleMarkdown(obj, message) {
  const rules = [
    {
      condition: {
        startsWith: ['# ']
      },
      handle(props) {
        props.tag = 'h1';
        props.content = props.content.substring(this.condition.startsWith[0].length);
        return props;
      }
    },
    {
      condition: {
        startsWith: ['## ']
      },
      handle(props) {
        props.tag = 'h2';
        props.content = props.content.substring(this.condition.startsWith[0].length);
        return props;
      }
    },
    {
      condition: {
        startsWith: ['### ']
      },
      handle(props) {
        props.tag = 'h3';
        props.content = props.content.substring(this.condition.startsWith[0].length);
        return props;
      }
    },
    {
      condition: {
        startsWith: ['#### ']
      },
      handle(props) {
        props.tag = 'h4';
        props.content = props.content.substring(this.condition.startsWith[0].length);
        return props;
      }
    },
    {
      condition: {
        startsWith: ['-# ']
      },
      handle(props) {
        const classIndex = props.attributes.findIndex(attr => attr.name === 'class');
        props.attributes[classIndex] = {
          name: 'class',
          value: `${props.attributes[classIndex].value} disclaimer`
        };

        props.content = props.content.substring(this.condition.startsWith[0].length);

        return props;
      }
    },
    {
      condition: {
        startsWith: ['* ', '- ']
      },
      handle(props) {
        props.tag = 'li';
        props.content = props.content.substring(this.condition.startsWith[0].length);

        return props;
      }
    },
    {
      condition: {
        regex: [getSurroundingRegex('**')]
      },
      handle(props) {
        props.content = props.content.replace(getSurroundingRegex('**'), '<strong>$1</strong>');
        return props;
      }
    },
    {
      condition: {
        regex: [getSurroundingRegex('_'), getSurroundingRegex('*')]
      },
      handle(props) {
        props.content = props.content.replace(getSurroundingRegex('_'), '<em>$1</em>');
        props.content = props.content.replace(getSurroundingRegex('*'), '<em>$1</em>');
        return props;
      }
    },
    {
      condition: {
        regex: [getSurroundingRegex('~~')]
      },
      handle(props) {
        props.content = props.content.replace(getSurroundingRegex('~~'), '<del>$1</del>');
        return props;
      }
    },
    {
      condition: {
        regex: [getSurroundingRegex('`')]
      },
      handle(props) {
        props.content = props.content.replace(getSurroundingRegex('`'), '<code>$1</code>');
        return props;
      }
    },
  ];

  const messageContent = message.querySelector(".message");

  let props = {
    tag: messageContent.tagName,
    content: messageContent.innerHTML,
    attributes: Array.from(messageContent.attributes),
  };

  for (const rule of rules) {
    const match = Object.entries(rule.condition).every(([conditionType, value]) => {
      switch (conditionType) {
        case 'startsWith': return value.some(check => props.content.startsWith(check));
        case 'endsWith': return value.some(check => props.content.endsWith(check));
        case 'contains': return value.some(check => props.content.includes(check));
        case 'regex': return value.some(pattern => pattern.test(props.content));
        default: return false;
      }
    });

    if (match) props = { ...props, ...rule.handle(props) };
  }

  const { tag, attributes, content } = props;
  const attributeString = attributes.reduce((acc, attr) => (
    acc += `${attr.name}="${attr.value}" `
  ), '');

  messageContent.outerHTML = `<${tag} ${attributeString.trim()}>${content}</${tag}>`;
}