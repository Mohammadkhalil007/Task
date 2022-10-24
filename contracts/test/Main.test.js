const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OpenApe", async function () {
  let accounts;
  let owners = [];
  let tokensContract, openApeContract, hammerContract, mainContract;
  [...accounts] = await ethers.getSigners();
  const user = accounts[0];

  this.beforeEach(async () => {
    let Tokens = ethers.getContractFactory("Tokens");
    tokensContract = Tokens.deploy();

    const options = { value: 10000 };
    tokensContract.connect(user).buyToken(100, options);
    owners.push(user.address);

    Main = ethers.getContractFactory("MAIN");
    mainContract = Main.deploy(
      owners,
      tokensContract.address,
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000"
    );

    OpenApe = ethers.getContractFactory("OpenApeNFT");
    openApeContract = OpenApe.deploy(mainContract.address);

    Hammer = ethers.getContractFactory("HammerNFT");
    hammerContract = Hammer.deploy(mainContract.address);

    mainContract.connect(user).setOpenApeAddress(openApeContract.address);
    mainContract.connect(user).setHammerAddress(hammerContract.address);
  });
  describe("Main Contract Deployment", () => {
    it("mint Open Ape token", async () => {
      tokensContract
        .connect(user)
        .approve(mainContract.address, ethers.utils.parseUnits("100", 18));

      mainContract.connect(user).mintOpenApe(user.address);
      expect(await openApeContract.balanceOf(user.address)).to.equal("1");
    });
  });
});
