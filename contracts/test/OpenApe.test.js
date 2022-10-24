const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OpenApe", async function () {
  let accounts;
  let tokensContract;

  this.beforeEach(async () => {
    Tokens = await ethers.getContractFactory("OpenApeNFT");
    tokensContract = await Tokens.deploy(
      "0x0000000000000000000000000000000000000000" // dummy address
    );
  });
  describe("Deployment", () => {
    it("Only smart contract can call this function", async () => {
      [...accounts] = await ethers.getSigners();
      const user = accounts[0];
      await expect(
        tokensContract.connect(user).mintNFT(user.address)
      ).to.be.revertedWith("Access forbidden");
    });
  });
});
