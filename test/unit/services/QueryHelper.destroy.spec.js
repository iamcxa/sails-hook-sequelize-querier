const samples = require('../samples');

describe('about QueryHelper.destroy operation.', function () {
  it('destroy should be success', async function () {
    const input = {
      ...samples.user,
    };

    const user = await User.create(input, {
      include: [],
    });

    await QueryHelper.destroy({
      modelName: 'User',
      ids: [user.id],
    });

    const target = await QueryHelper.getDetail({
      modelName: 'User',
      include: [],
      where: {
        id: user.id,
      },
    });

    SpecHelper.validateEach(
      {
        target,
        source: {},
      },
      {
        strictMode: false,
        log: true,
      },
    );
  });

  it('destroy and use include models should be success', async function () {
    const input = {
      ...samples.user,
      Image: samples.image,
    };

    const user = await User.create(input, {
      include: [Image],
    });

    await QueryHelper.destroy({
      modelName: 'User',
      include: [Image],
      ids: [user.id],
    });

    const target1 = await QueryHelper.getDetail({
      modelName: 'User',
      include: [],
      where: {
        id: user.id,
      },
    });

    const target2 = await QueryHelper.getDetail({
      modelName: 'Image',
      include: [],
      where: {
        id: user.Image.id,
      },
    });

    SpecHelper.validateEach(
      {
        target: target1,
        source: {},
      },
      {
        strictMode: false,
        log: true,
      },
    );
    SpecHelper.validateEach(
      {
        target: target2,
        source: {},
      },
      {
        strictMode: false,
        log: true,
      },
    );
  });

  it('destroy wrong modelName should be fail', async function () {
    const input = {
      ...samples.user,
    };

    const user = await User.create(input, {
      include: [],
    });

    try {
      await QueryHelper.destroy({
        modelName: 'test',
        ids: [user.id],
      });
    } catch (err) {
      err.message.should.equal(
        JSON.stringify({
          message: 'BadRequest.Target.Model.Not.Exits',
          code: 400,
          extra: { modelName: 'test' },
        }),
      );
    }
  });
});
