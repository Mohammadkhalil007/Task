const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", async function () {
  let accounts;
  let tokensContract;

  this.beforeEach(async () => {
    Tokens = await ethers.getContractFactory("Tokens");
    tokensContract = await Tokens.deploy();
  });

  describe("Deployment", () => {
    it("The contract should have this balance", async () => {
      expect(await tokensContract.balanceOf(tokensContract.address)).to.equal(
        ethers.utils.parseUnits("5000000", 18)
      );
    });

    it("buy Tokens", async () => {
      [...accounts] = await ethers.getSigners();
      const user = accounts[0];
      const options = { value: 10000 };
      await tokensContract.connect(user).buyToken(100, options);
      expect(await tokensContract.balanceOf(user.address)).to.equal(
        "100000000000000000000" // 100 tokens
      );
    });

    it("buying with not enough balance", async () => {
      [...accounts] = await ethers.getSigners();
      const user = accounts[0];
      const options = { value: 1000 };

      await expect(
        tokensContract.connect(user).buyToken(100, options)
      ).to.be.revertedWith("Not enough balance given to buy tokens");
    });
  });
});
