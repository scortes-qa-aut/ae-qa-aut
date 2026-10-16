import { $ } from '@wdio/globals';
import { browser } from '../utils/browser';

class RegisterPage {
  get signupLoginLink() { return $('a[href="/login"]'); }
  get signupNameInput() { return $('input[data-qa="signup-name"]'); }
  get signupEmailInput() { return $('input[data-qa="signup-email"]'); }
  get signupButton() { return $('button[data-qa="signup-button"]'); }

  get titleMr() { return $('#id_gender1'); }
  get passwordInput() { return $('input[data-qa="password"]'); }
  get firstNameInput() { return $('input[data-qa="first_name"]'); }
  get lastNameInput() { return $('input[data-qa="last_name"]'); }
  get addressInput() { return $('input[data-qa="address"]'); }
  get countrySelect() { return $('select[data-qa="country"]'); }
  get stateInput() { return $('input[data-qa="state"]'); }
  get cityInput() { return $('input[data-qa="city"]'); }
  get zipcodeInput() { return $('input[data-qa="zipcode"]'); }
  get mobileInput() { return $('input[data-qa="mobile_number"]'); }
  get createAccountButton() { return $('button[data-qa="create-account"]'); }
  get accountCreatedHeader() { return $('h2[data-qa="account-created"]'); }
  get continueButton() { return $('a[data-qa="continue-button"]'); }

  async startSignup(name: string, email: string) {
    await this.signupLoginLink.waitForDisplayed({ timeout: 20000 });
    await this.signupLoginLink.click();

    await this.signupNameInput.waitForDisplayed({ timeout: 20000 });
    await this.signupNameInput.setValue(name);
    await this.signupEmailInput.setValue(email);
    await this.signupButton.click();

    await browser.pause(2000);
  }

  async completeForm(password: string, firstName: string, lastName: string) {
    await this.titleMr.waitForDisplayed({ timeout: 20000 });
    await this.titleMr.click();
    await this.passwordInput.setValue(password);
    await this.firstNameInput.setValue(firstName);
    await this.lastNameInput.setValue(lastName);
    await this.addressInput.setValue('123 Test St');

    await this.countrySelect.scrollIntoView();
    await this.countrySelect.selectByAttribute('value', 'United States');

    await this.stateInput.setValue('Test State');
    await this.cityInput.setValue('Test City');
    await this.zipcodeInput.setValue('12345');
    await this.mobileInput.setValue('1234567890');

    await this.createAccountButton.scrollIntoView();
    await this.createAccountButton.click();
  }

  async isAccountCreated(): Promise<boolean> {
    await this.accountCreatedHeader.waitForDisplayed({ timeout: 30000 });
    return this.accountCreatedHeader.isDisplayed();
  }
}

export default new RegisterPage();