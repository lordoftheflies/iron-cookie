/** @license
iron-cookie, a Polymer element for managing cookies.
Copyright (C) 2016  Kevin Boxhoorn

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * # `<iron-cookie>`
 *
 * Polymer element for managing cookies.

 * In typical use, just slap some `<awesome-sauce>` at the top of your body:
 * <body>
 *   <iron-cookie></iron-cookie>
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 *
 */
class IronCookieElement extends PolymerElement {
    static get is() {
        return "iron-cookie";
    }

    static get properties() {
        return {
            /**
             * Name of the cookie to manipulate.
             */
            name: {
                type: String,
                observer: "_nameChanged"
            },
            /**
             * Value of the cookie.
             */
            value: {
                type: String,
                notify: true,
                observer: "_setCookieWrapper"
            },
            /**
             * Length of time to keep the cookie before expiring it. Can be a
             * `Number` of days, UTC time `String`, or `Object` with values
             * corresponding to the arguments of the JavaScript `Date`
             * contructor (e.g. `{ year: 2018, month: 11, day: 31 }`).
             * See [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) for more info.
             * @type {String|Number|Object}
             */
            expires: {
                type: Object,
                observer: "_setCookieWrapper"
            },
            /**
             * URL path that the cookie is available to.
             */
            path: {
                type: String,
                value: "/"
            },
            /**
             * Toggles the `secure` flag of the cookie. This makes it only get
             * sent with HTTPS requests.
             */
            secure: {
                type: Boolean,
                observer: "_setCookieWrapper",
                value: false
            },
            /**
             * Whether to encode and decode the cookie using `encodeURIComponent`
             * and `decodeURIComponent`. This allows values such as `;` and `=`
             * to be a part of the cookie without it being corrupted.
             * Recommended if data bound to user input.
             */
            uriSafe: {
                type: Boolean,
                value: false
            },
            /**
             * Get the cookie manually using the `getCookie` method. This
             * disables automatically loading the cookie when the element is
             * initialized.
             */
            manualGet: {
                type: Boolean,
                value: false
            },
            /**
             * Set the cookie manually using the `setCookie` method. This
             * disables automatically setting the cookie when `value` changes.
             */
            manualSet: {
                type: Boolean,
                value: false
            }
        };
    }

    _nameChanged() {
        this.value = this._getCookie();
    }

    _getCookie(force = false) {
        if (this.manualGet && !force)
            return "";

        var name = this.name + "=";
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            while (cookie.charAt(0) == " ")
                cookie = cookie.substring(1);
            if (cookie.indexOf(name) == 0) {
                cookie = cookie.substring(name.length, cookie.length);
                return this.uriSafe ? decodeURIComponent(cookie) : cookie;
            }
        }
        return "";
    }

    _setCookie(force = false) {
        if (this.manualSet && !force)
            return;
        if (this.name === undefined || this.value === undefined)
            return;

        var date = new Date();
        var expiresTime;
        if (typeof this.expires == "number")
            expiresTime = this.expires * 24 * 60 * 60 * 1000;
        else if (typeof this.expires == "string")
            expiresTime = new Date(this.expires).getTime();
        else if (typeof this.expires == "object")
            expiresTime = new Date(this.expires.year, this.expires.month, this.expires.day, this.expires.hour, this.expires.minutes, this.expires.seconds, this.expires.milliseconds).getTime();
        date.setTime(date.getTime() + (expiresTime || 0));

        var value = this.value;
        if (this.uriSafe)
            value = encodeURIComponent(this.value);
        if (typeof value != "string")
            return;
        else if (value.indexOf(";") > 0 || value.indexOf("=") > 0)
            throw new Error("`value` cannot contain ';' or '=' characters when `uriSafe` is not true");
        var cookie = this.name + "=" + value;
        if (expiresTime != undefined)
            cookie += "; expires=" + date.toUTCString();
        cookie += "; path=" + this.path;
        if (this.secure)
            cookie += "; secure";
        document.cookie = cookie;
    }

    /**
     * Stops arguments being passed from observers.
     */
    _setCookieWrapper() {
        this._setCookie();
    }

    /**
     * Sets the cookie. Only useful when manualSet is true.
     */
    setCookie() {
        this._setCookie(true);
    }

    /**
     * Gets the cookie. Only useful when manualGet is true.
     */
    getCookie() {
        this.value = this._getCookie(true);
    }
}

customElements.define(IronCookieElement.is, IronCookieElement);
