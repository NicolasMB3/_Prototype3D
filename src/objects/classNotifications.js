export class ClassNotifications {
    constructor() {
        this.notifications = [];
        this.notificationContainer = document.querySelector('.notification-center');
        this.timeOutNotification = 60000;
    }

    addNotification(notification) {
        this.notifications.push(notification);
        this.notificationContainer.appendChild(notification);
    }

    createNotificationElement(title, message) {
        const notification = document.createElement('div');
        const h2 = document.createElement('h2');
        const messageDiv = document.createElement('div');
        const contentDiv = document.createElement('div');

        h2.textContent = title;
        messageDiv.textContent = message;

        contentDiv.appendChild(h2);
        contentDiv.appendChild(messageDiv);
        contentDiv.classList.add('notification-content');

        notification.className = 'notification';
        notification.appendChild(contentDiv);

        return notification;
    }

    addNotificationButton(notification, button, buttonAction) {
        button.addEventListener('click', () => {
            if (buttonAction) {
                buttonAction();
            }
            this.notificationContainer.removeChild(notification);
        });
        notification.appendChild(button);
    }

    setNotificationColor(notification, color) {
        if (color) {
            notification.style.setProperty('--notification-color', color);
        }
    }

    displayNotification(title, message, button = null, buttonAction = null, color = null) {
        const notification = this.createNotificationElement(title, message);

        if (button) {
            this.addNotificationButton(notification, button, buttonAction);
        }

        this.setNotificationColor(notification, color);

        this.addNotification(notification);
        this.removeTimeoutNotification(notification);
    }

    removeTimeoutNotification(notification) {
        setTimeout(() => {
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
                const replayButton = notification.querySelector('.replay-button');
                if (replayButton) {
                    replayButton.remove();
                }
                notification.remove();
            }
        }, this.timeOutNotification);
    }
}