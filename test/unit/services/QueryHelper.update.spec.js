const samples = require('../samples');

describe('about QueryHelper.update operation.', function () {
  it('update should be success', async function () {
    const input = {
      ...samples.user,
    };

    const user = await User.create(input, {
      include: [],
    });

    const name = 'debugger';
    await QueryHelper.update({
      modelName: 'User',
      input: {
        name,
      },
      where: {
        id: user.id,
      },
    });

    const target = await QueryHelper.getDetail(
      {
        modelName: 'User',
        include: [],
        where: {
          id: user.id,
        },
      },
      {
        raw: true,
      },
    );

    const source = {
      ...samples.builder('user'),
    };

    SpecHelper.validateEach(
      {
        target,
        source,
      },
      {
        strictMode: false,
        log: true,
      },
    );
    target.name.should.equal(name);
  });

  it('update and use include models should be success', async function () {
    const input = {
      ...samples.user,
      Image: samples.image,
    };

    const user = await User.create(input, {
      include: [Image],
    });

    const url = 'http://goo.gl';
    await QueryHelper.update({
      modelName: 'User',
      include: [Image],
      input: {
        Image: {
          url,
        },
      },
      where: {
        id: user.id,
      },
    });

    const target = await QueryHelper.getDetail(
      {
        modelName: 'User',
        include: [Image],
        where: {
          id: user.id,
        },
      },
      {
        raw: true,
      },
    );

    const source = {
      ...samples.builder('user'),
      Image: samples.builder('image', true),
    };

    SpecHelper.validateEach(
      {
        target,
        source,
      },
      {
        strictMode: false,
        log: true,
      },
    );

    target.Image.url.should.equal(url);
  });

  it('update wrong modelName should be fail', async function () {
    const input = {
      ...samples.user,
    };

    const user = await User.create(input, {
      include: [],
    });

    try {
      await QueryHelper.update({
        modelName: 'test',
        input,
        where: {
          id: user.id,
        },
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
